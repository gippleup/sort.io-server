import Express from 'express';
import generateMap, {MapOption} from '../algo/generateMap';

const controller = {
  generate(req: Express.Request, res: Express.Response) {
    const { blockStackCount, colorCount, maxScore, stackLengthMax, stackLengthMin, shuffleCount } = req.query;
    const option: MapOption = {
      blockStackCount: Number(blockStackCount),
      colorCount: Number(colorCount),
      maxScore: Number(maxScore),
      stackLengthMax: Number(stackLengthMax) || 8,
      stackLengthMin: Number(stackLengthMin) || 2,
      shuffleCount: Number(shuffleCount) || 1000,
    }
    if (blockStackCount === undefined
      || colorCount === undefined
      || maxScore === undefined) {
        res.status(400)
        res.send('INVALID INPUT');
      } else {
        const map = generateMap(option);
        res.send(JSON.stringify(map));
      }
  }
}

export default controller;