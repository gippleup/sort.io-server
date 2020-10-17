import { ExpressController } from "../types"
import { User } from "../../entity/User"
import { getRepository, createQueryBuilder, Repository } from "typeorm";
import { addPurchaseHistory } from "../../utils/purchase";
import { skinList } from "../../asset/items/skin";
import { expressionList } from "../../asset/items/expression";

type GuestControllerTypes = "create";

type GuestController = {
  [T in GuestControllerTypes]: ExpressController;
}


const controller: GuestController = {
  create: async (req, res) => {
    const userRepo = getRepository(User);
    const user = new User();
    const lastUserId = await userRepo
      .createQueryBuilder("user")
        .orderBy("user.id", "DESC")
        .getOne()
        .then((data) => {
          if (data) return data.id;
          return 0;
        });
    user.name = 'guest' + (lastUserId + 1);
    user.isTemp = true;
    await userRepo.save(user);
    const createdGuest = await userRepo.findOne({where: {
      id: user.id,
    }});
    await addPurchaseHistory(user.id, {
      category: "skin",
      name: "basic",
    }, 0)
    const basicSkin: (keyof typeof skinList)[] = ["basic"];
    const basicExpression: (keyof typeof expressionList)[] = [
      "like",
      "trophy",
      "meh",
      "heart",
      "sad"
    ];
    await Promise.all(
      [...basicSkin.map((name) => {
        return addPurchaseHistory(user.id, {
          category: "expression",
          name,
        }, 0)
      }),
      ...basicExpression.map((name) => {
        return addPurchaseHistory(user.id, {
          category: "expression",
          name,
        }, 0)
      })],
    )
    res.json(createdGuest);
  },
}

export default controller
