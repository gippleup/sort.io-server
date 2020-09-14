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
  userId: number,
  name: string,
  userCreatedAt: string,
  win: string,
  draw: string,
  lose: string,
  total: number,
  winningRate: number,
  KBI: number,
  rank: string,
  rate: string
}

type ConvertedMultiPlayRankData = {
  userId: number,
  name: string,
  userCreatedAt: string,
  win: number,
  draw: number,
  lose: number,
  total: number,
  winningRate: number,
  KBI: number,
  rank: number,
  rate: number
}

type MultiPlayRankReturnData = {
  targetUser: ConvertedMultiPlayRankData;
  beforeTargetUser: ConvertedMultiPlayRankData[];
  afterTargetUser: ConvertedMultiPlayRankData[];
  total: number;
};

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
        user INNER JOIN multi_play as multi
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
    ROUND(LOG(@total) * @rate * 100) AS KBI
  `

  const userRank = getConnection().query(`
  SELECT
      *,
      @rank := ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.userCreatedAt DESC) AS 'rank',
      ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.userCreatedAt DESC) / ${totalUser} AS 'rate'
    FROM
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
      ) AS record

    ORDER BY record.KBI DESC
  `).then((data: RawMultiPlayRankData[]) => {
    const convertedData: ConvertedMultiPlayRankData[] = data.map((row) => {
      const {KBI, draw, lose, name, rank, rate, total, userCreatedAt, userId, win, winningRate} = row;
      return {
        userId,
        name,
        userCreatedAt,
        win: Number(win),
        draw: Number(draw),
        lose: Number(lose),
        total,
        winningRate,
        KBI: KBI,
        rank: Number(rank),
        rate: Number(rate)
      }
    })
    let targetUser: undefined | ConvertedMultiPlayRankData;
    let targetIndex;
    for (let i = 0; i < convertedData.length; i += 1) {
      const curRow = convertedData[i];
      if (curRow.userId === id) {
        targetUser = curRow;
        targetIndex = i;
        break;
      }
    }
    if (targetUser && targetIndex !== undefined) {
      return {
        targetUser,
        beforeTargetUser: convertedData.slice(Math.max(0, targetIndex - padding), targetIndex),
        afterTargetUser: convertedData.slice(targetIndex + 1, Math.min(data.length, targetIndex + 1 + padding)),
        total: totalUser
      };
    } else {
      return null
    }
  })

  return userRank;
}