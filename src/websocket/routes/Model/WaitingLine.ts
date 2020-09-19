import Player from "./Player";
import mergeSort from "../utils/mergeSort";
import GameRoom from './GameRoom';
import {rooms} from '../index'

class WaitingLine {
  line: Player[] = [];

  constructor() {}

  add(player: Player) {
    player.reset();
    console.log(player);
    this.line.push(player);

    this.findMatch(player)
      .then((players) => {
        const [player1, player2] = players;
        const gameRoom = new GameRoom(player1, player2);
        gameRoom.generateMap()
          .then(() => {
            if (gameRoom.roomId !== undefined) {
              rooms[gameRoom.roomId] = gameRoom;
              gameRoom.sendRoomData();
            }
          })
      })
      .catch(() => {})
  }

  delete(player: Player | number) {
    this.line = this.line.filter((entry) => {
      if (typeof player === 'number') {
        entry.id !== player;
      } else {
        entry !== player
      }
    });
    return this;
  }

  findMatch(player: Player) {
    return new Promise<[Player, Player]>((resolve, reject) => {
      const opponents = this.line.filter((entry) => entry.id !== player.id);
      const opponent = opponents.pop();
      if (opponent && opponent !== player) {
        resolve ([opponent, player]);
        this.line = this.line
          .filter((entry) => entry !== player && entry !== opponent)
      } else {
        reject(null);
      }
    })
  }
}

export default WaitingLine;