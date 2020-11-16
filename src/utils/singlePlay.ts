import { SinglePlay } from "../entity/SinglePlay";
import { getRepository, getConnection } from "typeorm";
import { User } from "../entity/User";
import { convertTimeToMs } from "./generic";
import { RankTableQueryOption } from "./multiPlay";

type RawUserRankData = {
  id: number;
  name: string;
  photo: string;
  createdAt: string;
  difficulty: string;
  rank: string;
  rate: string;
}

export const getSinglePlayByUserId = (id: number) => {
  const singleRepo = getRepository(SinglePlay);
  const games = singleRepo.createQueryBuilder("single_play")
    .where("single_play.userId = :id", { id })
    .getMany();
  return games;
}

const getSinglePlayRankQuery = async (option: RankTableQueryOption) => {
  const fromDate = option.type === "recent" ? Date.now() - convertTimeToMs({day: option.recent}) : null;
  const userRepo = getRepository(User);
  const totalUser = await userRepo
    .createQueryBuilder("user")
    .getCount();

  const dateQuery = fromDate !== null
    ? `WHERE UNIX_TIMESTAMP(S.createdAt) >= ${fromDate / 1000}`
    : "";

  const lastGameTable = `
    SELECT
      single.userId,
      MAX(single.id) AS gameId
    FROM single_play AS single
    GROUP BY single.userId
  `;

  const rankTableQuery = `
    SELECT
      user.id,
      user.name,
      user.profileImg as photo,
      S.createdAt,
      IFNULL(S.difficulty, -1) as difficulty,
      @rank := ROW_NUMBER() OVER(ORDER BY S.difficulty DESC, S.createdAt DESC) as 'rank',
      @rate := ROW_NUMBER() OVER(ORDER BY S.difficulty DESC, S.createdAt DESC) / ${ totalUser } as 'rate'
    FROM
      user LEFT JOIN (${lastGameTable}) AS last_game ON user.id = last_game.userId
      LEFT JOIN single_play AS S ON S.id = last_game.gameId
    ${dateQuery}
  `;  

  return rankTableQuery;
}

export const getSinglePlayRankByUserId = async (
  id: number,
  padding = 3,
) => {
  const userRepo = getRepository(User);
  const totalUser = await userRepo
    .createQueryBuilder("user")
    .getCount();
  const rankTableQuery = await getSinglePlayRankQuery({type: "all"});

  const targetUserRow: RawUserRankData[] = await getConnection()
  .query(`
    SELECT * FROM (${rankTableQuery}) as t1
    WHERE t1.id=${id}
  `);

  if (!targetUserRow) return null;
  const rank = Number(targetUserRow[0].rank);

  const paddedRankTable = await getConnection()
    .query(`
      SELECT * FROM (${rankTableQuery}) as t1
      WHERE t1.rank <= ${rank + padding} AND t1.rank >= ${rank - padding}
    `).then((data) => {
      let targetUser;
      let targetIndex;

      for (let i = 0; i < data.length; i += 1) {
        const curRow = data[i];
        if (curRow.id === id) {
          targetUser = curRow;
          targetIndex = i;
          break;
        }
      }

      if (targetIndex !== undefined) {
        return {
          targetUser,
          beforeTargetUser: data.slice(Math.max(0, targetIndex - padding), targetIndex),
          afterTargetUser: data.slice(targetIndex + 1, Math.min(data.length, targetIndex + 1 + padding)),
          total: totalUser
        };
      } else {
        return 'NO SUCH USER'
      }
    })
  return paddedRankTable;
}

export const getSinglePlayRankFromTo = async (
  from: number,
  to: number,
  recent: number = 7,
) => {
  const rankTableQuery = await getSinglePlayRankQuery({type: "recent", recent})

  const rankTable: RawUserRankData[] = await getConnection()
  .query(`
    SELECT * FROM (${rankTableQuery}) as t1
    LIMIT ${from}, ${to - from}
  `);

  return rankTable;
}