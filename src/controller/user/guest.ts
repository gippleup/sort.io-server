import { ExpressController } from "../types"
import { User } from "../../entity/User"
import { getRepository, createQueryBuilder, Repository } from "typeorm";

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
    await userRepo.save(user);
    const createdGuest = await userRepo.find({where: {
      id: user.id,
    }});
    res.json(createdGuest);
  },
}

export default controller
