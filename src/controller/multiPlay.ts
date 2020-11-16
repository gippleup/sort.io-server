import { ExpressController } from "./types"
import { SinglePlay } from "../entity/SinglePlay"
import { getRepository, createQueryBuilder, getConnection } from "typeorm";
import { MultiPlay } from "../entity/MultiPlay";
import { User } from "../entity/User";
import { getMultiPlayRankByUserId, getMultiPlayRankFromTo } from "../utils/multiPlay";
import { convertTimeToMs } from "../utils/generic";

type MultiPlayControllerTypes = "save" | "rank";

type MultiPlayController = {
  [T in MultiPlayControllerTypes]: ExpressController;
};

const controller: MultiPlayController = {
  save: async (req, res) => {
    const {
      winner,
      difficulty,
      user1, user2,
      timeConsumed,
    } = req.body;
    if (winner !== user1 && winner !== user2) {
      return res.end('장난질 금지');
    }
    const newData = new MultiPlay();
    newData.difficulty = Number(difficulty);
    newData.user1 = Number(user1);
    newData.user2 = Number(user2);
    newData.winner = Number(winner);
    newData.timeConsumed = timeConsumed;
    const matchRepo = getRepository(MultiPlay);
    try {
      const savedData = await matchRepo.save(newData);
      res.json(savedData);
    } catch (e) {
      res.send(e);
    }
  },
  rank: async (req, res) => {
    const userId = req.query.userId;
    const padding = req.query.padding || 3;
    if (userId !== undefined) {
      const userRank = await getMultiPlayRankByUserId(Number(userId), Number(padding));
      return res.send(userRank);
    }

    const from = req.query.from || 0;
    const to = req.query.to;
    const recent = req.query.recent || 7;
    if (from !== undefined && to !== undefined) {
      const rankTable = await getMultiPlayRankFromTo(Number(from), Number(to), Number(recent));
      return res.send(rankTable);
    }
  }
}

export default controller