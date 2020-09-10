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

export const getMultiPlayRankByUserId = async (id: number, padding = 3) => {
  const userRepo = getRepository(User);
  const totalUser = await userRepo
    .createQueryBuilder("user")
    .getCount();

  const userRank = getConnection().query(`
  SELECT
      *,
      @rank := ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.userCreatedAt DESC) AS 'rank',
      ROW_NUMBER() OVER (ORDER BY record.KBI DESC, record.userCreatedAt DESC) / ${totalUser} AS 'rate'
    FROM
      (SELECT
        t1.userId,
        t1.username,
        t1.userCreatedAt,
        t1.win,
        t2.draw,
        t3.lose,
        @total := t1.win + t2.draw + t3.lose AS total,
        @rate := t1.win / @total AS winningRate,
        ROUND(LOG(@total) * @rate * 100) AS KBI
      FROM

      (SELECT
        playRecord.userId,
        playRecord.username,
        playRecord.userCreatedAt,
        COUNT(playRecord.userId) AS win
      FROM
        (SELECT
          user.id as userId,
          user.name as username,
          user.createdAt as userCreatedAt,
          multi.winner
        FROM
          user INNER JOIN multi_play as multi
          ON multi.user1 = user.id OR multi.user2 = user.id) AS playRecord
      WHERE playRecord.winner = playRecord.userId
      GROUP BY playRecord.userid) AS t1

      INNER JOIN

      (SELECT
        playRecord.userId,
        COUNT(playRecord.userId) AS draw
      FROM
        (SELECT
          user.id as userId,
          multi.winner
        FROM
          user INNER JOIN multi_play as multi
          ON multi.user1 = user.id OR multi.user2 = user.id) AS playRecord
      WHERE playRecord.winner = -1
      GROUP BY playRecord.userid) AS t2

      ON t2.userId = t1.userId

      INNER JOIN

      (SELECT
        playRecord.userId,
        COUNT(playRecord.userId) AS lose
      FROM
        (SELECT
          user.id as userId,
          multi.winner
        FROM
          user INNER JOIN multi_play as multi
          ON multi.user1 = user.id OR multi.user2 = user.id) AS playRecord
      WHERE NOT playRecord.winner = playRecord.userId AND NOT playRecord.winner = -1
      GROUP BY playRecord.userid) AS t3

      ON t3.userId = t1.userId) AS record

    ORDER BY record.KBI DESC
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