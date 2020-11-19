import { getMultiPlayRankByUserId } from "../../../utils/multiPlay";

export const getLineIndex = (userId: number): Promise<null | number> => {
  return getMultiPlayRankByUserId(userId, 0, 3650000)
    .then((userRankData) => {
      if (!userRankData) return 0;
      const KBI = userRankData?.targetUser.KBI;
      const lineIndex = Math.floor(KBI / 5);
      return lineIndex;
    })
}