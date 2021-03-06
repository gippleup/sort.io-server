import { ExpressController } from "./types"
import { SinglePlay } from "../entity/SinglePlay"
import { getRepository, createQueryBuilder, getConnection } from "typeorm";
import { User } from "../entity/User";
import { getSinglePlayByUserId, getSinglePlayRankByUserId, getSinglePlayRankFromTo } from "../utils/singlePlay";
import { convertTimeToMs } from "../utils/generic";

type SinglePlayControllerTypes = "save" | "rank" | "data";

type SinglePlayController = {
  [T in SinglePlayControllerTypes]: ExpressController;
};

const controller: SinglePlayController = {
  data: async (req, res) => {
    const {userId} = req.query;
    const data = await getSinglePlayByUserId(Number(userId));
    res.send(data);
  },
  save: async (req, res) => {
    const {difficulty, userId, createdAt} = req.body;
    const newData = new SinglePlay();
    newData.difficulty = Number(difficulty);
    newData.userId = Number(userId);
    newData.createdAt = createdAt;
    const singlePlayRepo = getRepository(SinglePlay);
    try {
      const savedData = await singlePlayRepo.save(newData);
      res.json(savedData);
    } catch (e) {
      res.send(e);
    }
  },
  rank: async (req, res) => {
    const userId = req.query.userId;
    const padding = req.query.padding || 3;
    const recent = req.query.recent || 7;
    if (userId !== undefined) {
      const userRank = await getSinglePlayRankByUserId(Number(userId), Number(padding), Number(recent));
      res.send(userRank);
    }

    const from = req.query.from;
    const to = req.query.to;
    if (from !== undefined && to !== undefined) {
      const rankTable = await getSinglePlayRankFromTo(Number(from), Number(to), Number(recent))
      res.send(rankTable);
    }
  }
}

export default controller