import { ExpressController } from "./types"
import { User } from "../entity/User"
import { getRepository, createQueryBuilder } from "typeorm";
import { SinglePlay } from "../entity/SinglePlay";
import { Match } from "../entity/Match";

type UserControllerTypes = "signup" | "signin" | "signout" | "delete";

type UserController = {
  [T in UserControllerTypes]: ExpressController;
} & {
  playdata: {
    get: ExpressController;
    post: ExpressController;
  }
}

const controller: UserController = {
  signup: async (req, res) => {
    const repo = getRepository(User);
    const user = new User();
    user.name = "JASON";
    try {
      await repo.save(user);
    } catch (e) {
      console.log(e);
    }
    const allUsers = await repo.find();
    console.log(allUsers);
    res.end('how is it going?')
  },
  signin: (req, res) => {
  },
  signout: (req, res) => {
  },
  delete: (req, res) => {
  },
  playdata: {
    get: async (req, res) => {
      const {userId} = req.query
      const userRepo = getRepository(User);
      const singlePlayRepo = getRepository(SinglePlay);
      const multiPlayRepo = getRepository(Match);
      const user = await userRepo
        .createQueryBuilder("user")
          .where("user.id = :id", {id: userId})
          .getOne();
      const singlePlay = await singlePlayRepo
        .createQueryBuilder("single_play")
          .where("single_play.userId = :userId", {userId: userId})
          .getMany();
      const multiPlay = await multiPlayRepo
        .createQueryBuilder("match")
        .where("match.user1 = :userId OR match.user2 = :userId", { userId: userId })
        .getMany();
      res.json({
        user,
        singlePlay,
        multiPlay,
      })
    },
    post: (req, res) => {
    }
  }
}

export default controller