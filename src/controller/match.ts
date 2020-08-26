import { ExpressController } from "./types"
import { SinglePlay } from "../entity/SinglePlay"
import { getRepository, createQueryBuilder } from "typeorm";
import { Match } from "../entity/Match";

type MatchControllerTypes = "save";

type MatchController = {
  [T in MatchControllerTypes]: ExpressController;
};

const controller: MatchController = {
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
    const newData = new Match();
    newData.difficulty = Number(difficulty);
    newData.user1 = Number(user1);
    newData.user2 = Number(user2);
    newData.winner = Number(winner);
    newData.timeConsumed = timeConsumed;
    const matchRepo = getRepository(Match);
    try {
      const savedData = await matchRepo.save(newData);
      res.json(savedData);
    } catch (e) {
      res.send(e);
    }
  }
}

export default controller