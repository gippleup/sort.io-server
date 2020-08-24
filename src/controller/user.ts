import { ExpressController } from "./types"
import { User } from "../entity/User"
import { getRepository, createQueryBuilder } from "typeorm";
import { getUserById } from "../utils/user";
import { getSinglePlayByUserId } from "../utils/singlePlay";
import { getMultiPlayByUserId } from "../utils/multiPlay";

type UserControllerPureTypes = "signup" | "signin" | "signout" | "delete";
type UserControllerDualTypes = "gold" | "playdata";

type UserController = {
  [T in UserControllerPureTypes]: ExpressController;
} & {
  [T in UserControllerDualTypes]: {
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
  gold: {
    get: async (req, res) => {
      const {userId} = req.query
      const user = await getUserById(Number(userId));
      const gold = user?.gold;
      res.send(gold);
    },
    post: async (req, res) => {
    },
  },
  playdata: {
    get: async (req, res) => {
      const {userId} = req.query
      const user = await getUserById(Number(userId));
      const singlePlay = await getSinglePlayByUserId(Number(userId));
      const multiPlay = await getMultiPlayByUserId(Number(userId));
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