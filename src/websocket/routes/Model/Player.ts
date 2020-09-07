import Ws from 'ws';

type PlayerConstructor = {
  ws: Ws,
  id: number,
}

class Player {
  client: Ws;
  id: number;
  score: number = 0;
  isReady: boolean = false;
  isPrepared: boolean = false;
  constructor(option: PlayerConstructor) {
    const {ws, id} = option;
    this.client = ws;
    this.id = id;
  }
}

export default Player;