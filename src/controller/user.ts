import { ExpressController } from "./types"
import { User } from "../entity/User"
import { getRepository, getConnection } from "typeorm";
import { getUserById, setUserData, getUserByGoogleId } from "../utils/user";
import { getSinglePlayByUserId } from "../utils/singlePlay";
import { getMultiPlayByUserId } from "../utils/multiPlay";

type UserControllerPureTypes = "signup" | "signin" | "signout" | "delete";
type UserControllerDualTypes = "gold" | "playdata" | "ticket";

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
    const {googleId, userId, photo, name} = req.body;
    try {
      await getRepository(User)
      .createQueryBuilder("user")
      .update()
      .set({googleId, profileImg: photo, name})
      .where("user.id = :id", {id: userId})
      .execute();
      res.end('ok')
    } catch (e) {
      res.end('FALIED TO SIGN UP')
    }
  },
  signin: (req, res) => {
  },
  signout: (req, res) => {
  },
  delete: (req, res) => {
  },
  gold: {
    get: async(req, res) => {
      const {userId} = req.query
      const user = await getUserById(Number(userId));
      const gold = user?.gold;
      res.send(gold);
    },
    post: async(req, res)  => {
      const {userId, newAmount} = req.body;
      try {
        await setUserData(userId, {
          gold: newAmount,
        })
        res.send('UPDATED GOLD')
      } catch (e) {
        res.send('GOLD UPDATE FAIL')
      }
    }
  },
  ticket: {
    get: async(req, res) => {
      const {userId} = req.query;
      const user = await getUserById(Number(userId));
      const ticket = user?.ticket;
      res.send(ticket);
    },
    post: async(req, res)  => {
      const {userId, newAmount} = req.body;
      try {
        await setUserData(userId, {
          ticket: newAmount,
        })
        res.send('UPDATED GOLD')
      } catch (e) {
        res.send('GOLD UPDATE FAIL')
      }
    }
  },
  playdata: {
    get: async(req, res) => {
      const {userId, googleId} = req.query;
      if (userId) {
        const user = await getUserById(Number(userId));
        if (user) {
          const singlePlay = await getSinglePlayByUserId(user.id);
          const multiPlay = await getMultiPlayByUserId(Number(userId));
          return res.json({
            user,
            singlePlay,
            multiPlay,
          })
        } else {
          return res.status(404).send('NO SUCH USER')
        }
      }

      if (googleId) {
        const user = await getUserByGoogleId(Number(googleId));
        if (user) {
          const singlePlay = await getSinglePlayByUserId(user.id);
          const multiPlay = await getMultiPlayByUserId(user.id);
          return res.json({
            user,
            singlePlay,
            multiPlay,
          })
        } else {
          return res.status(404).send('NO SUCH USER')
        }
      }

      return res.status(404).send('GOOGLEID OR USERID IS REQUIRED')
    },
    post: (req, res) => {
    }
  },
}

export default controller