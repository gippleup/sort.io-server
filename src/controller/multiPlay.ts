import { ExpressController } from "./types"
import { SinglePlay } from "../entity/SinglePlay"
import { getRepository, createQueryBuilder } from "typeorm";
import { MultiPlay } from "../entity/MultiPlay";

type MultiPlayControllerTypes = "save";

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
  }
}

export default controller