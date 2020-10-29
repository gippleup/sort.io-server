import { SinglePlay } from "../entity/SinglePlay";
import { getRepository, getConnection } from "typeorm";
import { MultiPlay } from "../entity/MultiPlay";
import { User } from "../entity/User";

export const getMultiPlayByUserId = (id: number) => {
  const multiRepo = getRepository(MultiPlay);
  const games = multiRepo.createQueryBuilder("match")
    .where("match.user1 = :id OR match.user2 = :id", { id })
    .getMany();
  return games;
}

type RawMultiPlayRankData = {
  id: number,
  name: string,
  createdAt: string,
  win: string,
  draw: string,
  lose: string,
  total: number,
  winningRate: number,
  KBI: number,
  rank: string,
  rate: string,
  photo: string,
}

type ConvertedMultiPlayRankData = {
  id: number,
  name: string,
  createdAt: string,
  win: number,
  draw: number,
  lose: number,
  total: number,
  winningRate: number,
  KBI: number,
  rank: number,
  rate: number,
  photo: string,
}

type MultiPlayRankReturnData = {
  targetUser: ConvertedMultiPlayRankData;
  beforeTargetUser: ConvertedMultiPlayRankData[];
  afterTargetUser: ConvertedMultiPlayRankData[];
  total: number;
};

const convertMultiPlayRankRow = (row: RawMultiPlayRankData): ConvertedMultiPlayRankData => {
  const {KBI, draw, lose, name, rank, rate, total, createdAt, id, win, winningRate, photo} = row;
  return {
    id,
    name,
    createdAt,
    win: Number(win),
    draw: Number(draw),
    lose: Number(lose),
    total,
    winningRate,
    KBI: KBI,
    rank: Number(rank),
    rate: Number(rate),
    photo
  }
}

export const getMultiPlayRankByUserId = async (id: number, padding = 3): Promise<MultiPlayRankReturnData | null> => {
  const userRepo = getRepository(User);
  const totalUser = await userRepo
    .createQueryBuilder("user")
    .getCount();

  const tableQueryFor = (type: 'win' | 'lose' | 'draw') => {
    const conditionQuery =  {
      win: 'WHERE playRecord.winner = playRecord.userId',
      draw: 'WHERE playRecord.winner = -1',
      lose: 'WHERE NOT playRecord.winner = playRecord.userId AND NOT playRecord.winner = -1',
    }

    const query = `
    SELECT
      playRecord.userId,
      playRecord.name,
      playRecord.userCreatedAt,
      COUNT(playRecord.userId) AS ${type}
    FROM
      (SELECT
        user.id as userId,
        user.name,
        user.createdAt as userCreatedAt,
        multi.winner
      FROM
        user LEFT JOIN multi_play as multi
        ON multi.user1 = user.id OR multi.user2 = user.id) AS playRecord
    ${conditionQuery[type]}
    GROUP BY playRecord.userid
    `

    return query;
  }

  const winTableQuery = tableQueryFor('win');
  const drawTableQuery = tableQueryFor('draw');
  const loseTableQuery = tableQueryFor('lose');

  const targetValues =`
    IFNULL(t1.userId, IFNULL(t2.userId, t3.userId)) as userId,
    IFNULL(t1.name, IFNULL(t2.name, t3.name)) as name,
    IFNULL(t1.userCreatedAt, IFNULL(t2.userCreatedAt, t3.userCreatedAt)) as userCreatedAt,
    @win := IFNULL(t1.win, 0) as win,
    @draw := IFNULL(t2.draw, 0) as draw,
    @lose := IFNULL(t3.lose, 0) as lose,
    @total := @win + @draw + @lose AS total,
    @rate := @win / @total AS winningRate,
    ROUND(LOG2(@total + 1) * @rate * 100) AS KBI
  `

  const userRankQuery = `
    SELECT
      *,
      @rank := ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.createdAt DESC) AS 'rank',
      ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.createdAt DESC) / ${totalUser} AS 'rate'
    FROM
      (SELECT
        user.id,
        user.name,
        user.createdAt,
        IFNULL(multiGameRecord.win, 0) as win,
        IFNULL(multiGameRecord.draw, 0) as draw,
        IFNULL(multiGameRecord.lose, 0) as lose,
        IFNULL(multiGameRecord.total, 0) as total,
        IFNULL(multiGameRecord.winningRate, 0) as winningRate,
        IFNULL(multiGameRecord.KBI, 0) as KBI,
        user.profileImg as photo
      FROM user
        LEFT JOIN
          (SELECT
            ${targetValues}
          FROM (${winTableQuery}) AS t1
            LEFT JOIN (${drawTableQuery}) AS t2 ON t1.userId = t2.userId
            LEFT JOIN (${loseTableQuery}) AS t3 ON t1.userId = t3.userId
          UNION ALL
          SELECT
            ${targetValues}
          FROM (${drawTableQuery}) AS t2
            LEFT JOIN (${winTableQuery}) AS t1 ON t2.userId = t1.userId
            LEFT JOIN (${loseTableQuery}) AS t3 ON t2.userId = t3.userId
          WHERE t1.userId IS NULL
          UNION ALL
          SELECT
            ${targetValues}
          FROM (${loseTableQuery}) AS t3
            LEFT JOIN (${winTableQuery}) AS t1 ON t3.userId = t1.userId
            LEFT JOIN (${drawTableQuery}) AS t2 ON t3.userId = t2.userId
          WHERE t1.userId IS NULL AND t2.userId IS NULL
          ) AS multiGameRecord
        ON user.id = multiGameRecord.userId
      ) AS record
    ORDER BY 'rank' DESC
  `

  const targetUserRow: RawMultiPlayRankData[] = await getConnection().query(`
    SELECT * FROM (${userRankQuery}) AS t1
    WHERE t1.id=${id}
  `);

  if (!targetUserRow) return null;
  const rank = Number(targetUserRow[0].rank);

  const paddedRankTable = getConnection().query(`
    SELECT * FROM (${userRankQuery}) AS t1
    WHERE t1.rank <= ${rank + padding} AND t1.rank >= ${rank - padding}
  `).then((data: RawMultiPlayRankData[]) => {
    let targetUser: undefined | RawMultiPlayRankData;
    let targetIndex;
    for (let i = 0; i < data.length; i += 1) {
      const curRow = data[i];
      if (curRow.id === id) {
        targetUser = curRow;
        targetIndex = i;
        break;
      }
    }
    if (targetUser && targetIndex !== undefined) {
      const beforeTargetUser = data.slice(Math.max(0, targetIndex - padding), targetIndex);
      const afterTargetUser = data.slice(targetIndex + 1, Math.min(data.length, targetIndex + 1 + padding));
      const slicedData = {
        targetUser: convertMultiPlayRankRow(targetUser),
        beforeTargetUser: beforeTargetUser.map(convertMultiPlayRankRow),
        afterTargetUser: afterTargetUser.map(convertMultiPlayRankRow),
        total: totalUser
      };
      return slicedData;
    } else {
      return null
    }
  })

  return paddedRankTable;
}