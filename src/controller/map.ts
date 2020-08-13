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
        return res.send('INVALID INPUT');
      }
  
    if (Number(shuffleCount) > 10000) {
      res.status(400)
      return res.send('suffleCount should not exceed 10000');
    }
    
    const map = generateMap(option);
    res.send(JSON.stringify(map));
  }
}

export default controller;