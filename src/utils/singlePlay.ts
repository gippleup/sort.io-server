import { SinglePlay } from "../entity/SinglePlay";
import { getRepository } from "typeorm";

export const getSinglePlayByUserId = (id: number) => {
  const singleRepo = getRepository(SinglePlay);
  const games = singleRepo.createQueryBuilder("single_play")
    .where("single_play.userId = :id", { id })
    .getMany();
  return games;
}