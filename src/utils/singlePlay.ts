import { SinglePlay } from "../entity/SinglePlay";
import { getRepository, getConnection } from "typeorm";
import { User } from "../entity/User";

export const getSinglePlayByUserId = (id: number) => {
  const singleRepo = getRepository(SinglePlay);
  const games = singleRepo.createQueryBuilder("single_play")
    .where("single_play.userId = :id", { id })
    .getMany();
  return games;
}

export const getSinglePlayRankByUserId = async (id: number, padding: number = 3) => {
  const userRepo = getRepository(User);
  const totalUser = await userRepo
    .createQueryBuilder("user")
    .getCount();

  const lastGameTable = `
    SELECT
      single.userId,
      MAX(single.id) AS gameId
    FROM single_play AS single
    GROUP BY single.userId
  `;

  const rankQuery = `
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
  `;
  const userRank = await getConnection()
    .query(rankQuery).then((data) => {
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
  return userRank;
}