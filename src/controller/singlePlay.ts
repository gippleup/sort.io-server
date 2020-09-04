import { ExpressController } from "./types"
import { SinglePlay } from "../entity/SinglePlay"
import { getRepository, createQueryBuilder, getConnection } from "typeorm";
import { User } from "../entity/User";
import { getSinglePlayRankByUserId } from "../utils/singlePlay";

type SinglePlayControllerTypes = "save" | "rank";

type SinglePlayController = {
  [T in SinglePlayControllerTypes]: ExpressController;
};

const controller: SinglePlayController = {
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
    const userId = Number(req.query.userId);
    const padding = Number(req.query.padding || 3);
    const userRank = await getSinglePlayRankByUserId(userId, padding);
    res.send(userRank);
  }
}

export default controller