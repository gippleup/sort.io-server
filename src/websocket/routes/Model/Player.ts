import Ws from 'ws';

type PlayerConstructor = {
  ws: Ws,
  id: number,
  name: string,
}

class Player {
  client: Ws;
  id: number;
  name: string;
  score: number = 0;
  isReady: boolean = false;
  isPrepared: boolean = false;
  receivedMap: boolean = false;
  hasLeftGame: boolean = false;
  constructor(option: PlayerConstructor) {
    const {ws, id, name} = option;
    this.client = ws;
    this.id = id;
    this.name = name;

    this.reset = this.reset.bind(this);
  }

  reset() {
    this.isPrepared = false;
    this.isReady = false;
    this.receivedMap = false;
    this.score = 0;
  }
}

export default Player;