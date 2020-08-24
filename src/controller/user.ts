import { ExpressController } from "./types"
import { User } from "../entity/User"
import { getRepository, createQueryBuilder } from "typeorm";

type UserControllerTypes = "signup" | "signin" | "signout" | "delete";

type UserController = {
  [T in UserControllerTypes]: ExpressController;
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
}

export default controller