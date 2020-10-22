import { getRepository, getConnection } from "typeorm"
import { PurchaseHistory } from "../entity/PurchaseHistory";
import { User } from "../entity/User"

export const getUserById = async (id: number) => {
  const userRepo = getRepository(User);
  const user = await userRepo
    .createQueryBuilder("user")
    .where("user.id = :id", {id})
    .getOne();
  return user;
}

export const getUserByGoogleId = async (id: string) => {
  const userRepo = getRepository(User);
  const user = await userRepo
    .createQueryBuilder("user")
    .where("user.googleId = :id", {id})
    .getOne();
  return user;
}

export const setUserData = async (userId: number, option: Partial<User>) => {
  return await getConnection()
    .createQueryBuilder()
    .update(User)
    .set(option)
    .where("id = :userId", { userId })
    .execute()
}

export const getPurchaseHistory = async (userId: number) => {
  const purchaseHistoryRepo = getRepository(PurchaseHistory);
}