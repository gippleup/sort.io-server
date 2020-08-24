import { ExpressController } from "./types"
import { SinglePlay } from "../entity/SinglePlay"
import { getRepository, createQueryBuilder } from "typeorm";

type SinglePlayControllerTypes = "save";

type SinglePlayController = {
  [T in SinglePlayControllerTypes]: ExpressController;
};

const controller: SinglePlayController = {
  save: async (req, res) => {
    const {difficulty, userId} = req.body;
    const newData = new SinglePlay();
    newData.difficulty = Number(difficulty);
    newData.userId = Number(userId);
    const singlePlayRepo = getRepository(SinglePlay);
    try {
      const savedData = await singlePlayRepo.save(newData);
      res.json(savedData);
    } catch (e) {
      res.send(e);
    }
  }
}

export default controller