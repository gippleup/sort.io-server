import { SinglePlay } from "../entity/SinglePlay";
import { getRepository } from "typeorm";
import { Match } from "../entity/Match";

export const getMultiPlayByUserId = (id: number) => {
  const singleRepo = getRepository(Match);
  const games = singleRepo.createQueryBuilder("match")
    .where("match.user1 = :id OR match.user2 = :id", { id })
    .getMany();
  return games;
}