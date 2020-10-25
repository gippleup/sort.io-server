import { getMultiPlayRankByUserId } from "../../../utils/multiPlay";

export const getLineIndex = (userId: number): Promise<null | number> => {
  return getMultiPlayRankByUserId(userId)
    .then((userRankData) => {
      if (!userRankData) return null;
      const KBI = userRankData?.targetUser.KBI;
      const lineIndex = Math.floor(KBI / 5);
      return lineIndex;
    })
}