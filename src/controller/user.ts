import { ExpressController } from "./types"
import { User } from "../entity/User"
import { getRepository, getConnection } from "typeorm";
import { getUserById, setUserData, getUserByGoogleId } from "../utils/user";
import { getSinglePlayByUserId } from "../utils/singlePlay";
import { getMultiPlayByUserId } from "../utils/multiPlay";
import { getCheckedItemList, purchase } from "../utils/purchase";

type UserControllerPureTypes = 
  "signup" 
  | "signin" 
  | "signout" 
  | "delete" 
  | "update"
  | "getResource";

type UserControllerDualTypes = 
  "gold" 
  | "playdata" 
  | "ticket"
  | "purchase";

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
    const existingData = await getUserByGoogleId(googleId);
    if (existingData) {
      res.json(existingData);
    } else {
      try {
        await getRepository(User)
          .createQueryBuilder("user")
          .update()
          .set({googleId, profileImg: photo, name, isTemp: false})
          .where("user.id = :id", {id: userId})
          .execute();
        const updatedData = await getUserByGoogleId(googleId);
        res.json(updatedData);
      } catch (e) {
        res.end('FALIED TO SIGN UP')
      }
    }
  },
  signin: (req, res) => {
  },
  signout: (req, res) => {
  },
  update: async (req, res) => {
    const {id, ...rest} = req.body;
    await setUserData(id, rest);
    res.end('ok');
  },
  delete: (req, res) => {
  },
  gold: {
    get: async(req, res) => {
      const {userId} = req.query;
      const user = await getUserById(Number(userId));
      const gold = user?.gold;
      res.send(gold);
    },
    post: async(req, res)  => {
      const {userId, amount, type} = req.body;
      const userData = await getUserById(userId);

      if (!userData) {
        return res.status(404).send("NO SUCH USER");
      }


      if (Number(amount) <= 0) {
        return res.status(400).send("INVALID INPUT")
      }

      const sign = type === "USE" ? -1 : 1;

      try {
        await setUserData(userId, {
          gold: userData.gold + (sign * amount),
        })
        const updateData = await getUserById(userId);
        res.json(updateData);
      } catch (e) {
        res.send('GOLD UPDATE FAIL');
      }
    }
  },
  getResource: async(req, res) => {
    const { userId } = req.body;
    const target: "gold" | "ticket" | undefined = req.body.target;
    if (!target) return res.send("TARGET IS NOT SPECIFIED");
    try {
      const userData = await getUserById(userId)
      if (userData) {
        res.send(userData[target]);
      } else {
        res.send('GHOST CAPTURED');
      }
    } catch (e) {
      res.send('GOLD UPDATE FAIL');
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
      const {userId, amount, type} = req.body;
      const userData = await getUserById(userId);

      if (!userData) {
        return res.status(404).send("NO SUCH USER");
      }

      if (amount <= 0) {
        return res.status(400).send("INVALID INPUT");
      }

      const sign = type === "USE" ? -1 : 1;

      try {
        await setUserData(userId, {
          ticket: userData.ticket + (sign * amount),
        })
        const updatedData = await getUserById(userId);
        res.json(updatedData);
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
        const user = await getUserByGoogleId(String(googleId));
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
  purchase: {
    get: async (req, res) => {
      const { userId } = req.query;
      const list = await getCheckedItemList(Number(userId));
      res.json(list);
    },
    post: async (req, res) => {
      const { userId, category, name } = req.body;
      try {
        await purchase(userId, {
          category,
          name,
        })
        const updatedItemList = await getCheckedItemList(userId);
        res.json(updatedItemList);
      } catch(e) {
        res.status(400).end('SOMETHING WENT WRONG');
      }
    }
  }
}

export default controller