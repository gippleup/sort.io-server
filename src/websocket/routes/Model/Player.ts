import Ws from 'ws';
import { waitingLine } from '..';
import { getUserById } from '../../../utils/user';

type PlayerConstructor = {
  ws: Ws,
  id: number,
  name: string,
  skin: string,
}

type ListenerKey = "close"

class Player {
  client: Ws;
  id: number;
  name: string;
  photo: string | undefined;
  score: number = 0;
  skin: string;
  isReady: boolean = false;
  isPrepared: boolean = false;
  receivedMap: boolean = false;
  hasLeftGame: boolean = false;
  listener: {[K in ListenerKey]: {[index: number]: (id: number) => any}} = {
    close: {}
  }
  listenerCount = 0;
  killOrder: NodeJS.Timer | null = null;
  lastResponseTimeStamp: number | null = null;
  constructor(option: PlayerConstructor) {
    const {ws, id, name, skin} = option;
    this.client = ws;
    this.id = id;
    this.name = name;
    this.skin = skin;
    
    this.client.addListener("message", () => {
      this.lastResponseTimeStamp = Date.now();
    })

    this.reset = this.reset.bind(this);
    this.fetchProfileImg = this.fetchProfileImg.bind(this);
  }

  fetchProfileImg() {
    return getUserById(this.id).then((user) => {
      this.photo = user?.profileImg;
    })
  }

  deleteSelfFromWaitingLine() {
    waitingLine.delete(this.id);
  }

  reset() {
    this.isPrepared = false;
    this.isReady = false;
    this.receivedMap = false;
    this.hasLeftGame = false;
    this.score = 0;
  }

  addListener(key: ListenerKey, cb: (userId: number) => any) {
    const id = this.listenerCount;
    this.listener[key][id] = cb;
    this.listenerCount += 1;
    this.client.onclose = () => Object
      .values(this.listener.close)
      .forEach((cb) => cb(this.id));
    return () => delete this.listener[key][id];
  }

  killIfNoResponseAfter(ms: number, callback?: (id: number) => any) {
    if (this.killOrder) {
      clearTimeout(this.killOrder)
    }

    this.killOrder = setTimeout(() => {
      if (!this.lastResponseTimeStamp) return;
      const timePassedFromLastResponse = Date.now() - this.lastResponseTimeStamp;
      const hadNoResponse = timePassedFromLastResponse > ms;
      if (hadNoResponse) {
        this.client.close();
        if (callback) {
          callback(this.id);
        }
      }
    }, ms)
  }

  cancelKillRequest() {
    if (this.killOrder) {
      clearTimeout(this.killOrder)
    }
  }
}

export default Player;