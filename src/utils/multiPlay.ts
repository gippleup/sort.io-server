import { SinglePlay } from "../entity/SinglePlay";
import { getRepository, getConnection } from "typeorm";
import { MultiPlay } from "../entity/MultiPlay";
import { User } from "../entity/User";
import { convertTimeToMs } from "./generic";

export const getMultiPlayByUserId = async (id: number) => {
  const multiRepo = getRepository(MultiPlay);
  const games = multiRepo.createQueryBuilder("multi_play")
    .where("multi_play.user1 = :id OR multi_play.user2 = :id", { id })
    .getMany();
  return games;
}

type RawMultiPlayRankData = {
  id: number,
  name: string,
  createdAt: string,
  gameCreatedAt: string,
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

type MultiPlayRankReturnData = {
  targetUser: RawMultiPlayRankData;
  beforeTargetUser: RawMultiPlayRankData[];
  afterTargetUser: RawMultiPlayRankData[];
  total: number;
};

export type RankTableQueryOption = {
  type: "all"
} | {
  type: "recent",
  recent: number,
}

const getMultiPlayRankQuery = async (option: RankTableQueryOption) => {
  const fromDate = option.type === "recent" ? Date.now() - convertTimeToMs({day: option.recent}) : null;
  const userRepo = getRepository(User);
  const totalUser = await userRepo
    .createQueryBuilder("user")
    .getCount();

  const dateQuery = fromDate !== null
    ? `WHERE UNIX_TIMESTAMP(record.gameCreatedAt) >= ${fromDate / 1000}`
    : "";

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
      playRecord.gameCreatedAt,
      COUNT(playRecord.userId) AS ${type}
    FROM
      (SELECT
        user.id as userId,
        user.name,
        user.createdAt as userCreatedAt,
        multi.createdAt as gameCreatedAt,
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
    IFNULL(t1.gameCreatedAt, IFNULL(t2.gameCreatedAt, t3.gameCreatedAt)) as gameCreatedAt,
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
      @rank := ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.gameCreatedAt DESC) AS 'rank',
      ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.gameCreatedAt DESC) / ${totalUser} AS 'rate'
    FROM
      (SELECT
        user.id,
        user.name,
        user.createdAt,
        multiGameRecord.gameCreatedAt,
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
    ${dateQuery}
    ORDER BY 'rank' DESC
  `

  return userRankQuery
}

export const getMultiPlayRankByUserId = async (
  id: number,
  padding: number = 3,
): Promise<MultiPlayRankReturnData | null> => {
  const userRepo = getRepository(User);
  const totalUser = await userRepo
    .createQueryBuilder("user")
    .getCount();
  const rankTableQuery = await getMultiPlayRankQuery({type: "all"})

  const targetUserRow: RawMultiPlayRankData[] = await getConnection().query(`
    SELECT * FROM (${rankTableQuery}) AS t1
    WHERE t1.id=${id}
  `);

  if (!targetUserRow.length) return null;
  const rank = Number(targetUserRow[0].rank);

  const paddedRankTable = await getConnection().query(`
    SELECT * FROM (${rankTableQuery}) AS t1
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
        targetUser: targetUser,
        beforeTargetUser: beforeTargetUser,
        afterTargetUser: afterTargetUser,
        total: totalUser
      };
      return slicedData;
    } else {
      return null
    }
  })

  return paddedRankTable;
}


export const getMultiPlayRankFromTo = async (
  from: number,
  to: number,
  recent: number
): Promise<RawMultiPlayRankData[] | null> => {
  const rankTableQuery = await getMultiPlayRankQuery({type: "recent", recent})

  const rankTable: RawMultiPlayRankData[] = await getConnection().query(`
    SELECT * FROM (${rankTableQuery}) AS t1
    LIMIT ${from}, ${to - from}
  `)

  return rankTable;
}