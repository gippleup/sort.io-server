import { getRepository } from "typeorm"
import { User } from "../entity/User"

export const getUserById = async (id: number) => {
  const userRepo = getRepository(User);
  const user = userRepo.createQueryBuilder("user")
  .where("user.id = :id", {id})
  .getOne();
  return user;
}