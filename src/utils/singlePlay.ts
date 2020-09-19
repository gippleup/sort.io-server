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
  const userRank = await getConnection()
    .query(`
      SELECT
        S.userId,
        U.name,
        S.difficulty,
        S.createdAt,
        ROW_NUMBER() OVER (ORDER BY S.difficulty DESC, S.createdAt DESC) as 'rank',
        ROW_NUMBER() OVER (ORDER BY S.difficulty DESC, S.createdAt DESC) / ${totalUser} as 'rate',
        U.profileImg as photo
      FROM
        (SELECT
          single.userId,
          MAX(single.id) AS gameId
        FROM single_play AS single
        GROUP BY single.userId) AS last_game
      INNER JOIN single_play AS S ON S.id = last_game.gameId
      INNER JOIN user AS U ON U.id = S.userId
      ORDER BY S.difficulty DESC, S.createdAt DESC
      `).then((data) => {
      let targetUser;
      let targetIndex;
      for (let i = 0; i < data.length; i += 1) {
        const curRow = data[i];
        if (curRow.userId === id) {
          targetUser = curRow;
          targetIndex = i;
          break;
        }
      }
      if (targetIndex) {
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