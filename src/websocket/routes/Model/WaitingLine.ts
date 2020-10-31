import Player from "./Player";
import mergeSort from "../utils/mergeSort";
import GameRoom from './GameRoom';
import {rooms} from '../index'
import { getMultiPlayRankByUserId } from "../../../utils/multiPlay";
import { getLineIndex } from "../utils/waitingLine";

class WaitingLine {
  line: {
    [index: number]: Player[]
  } = {};

  constructor() {}

  add(player: Player) {
    const {lineIndex} = player;
    if (lineIndex === null) return;

    if (this.line[lineIndex] === undefined) {
      this.line[lineIndex] = [];
    }

    this.line[lineIndex].push(player);
    player.addListener("close", () => {
      this.delete(player)
    });

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

  async delete(player: Player | number) {
    let lineIndex = null;
    if (player instanceof Player) {
      lineIndex = player.lineIndex;
    } else {
      lineIndex = await getLineIndex(player);
    }
    if (lineIndex === null) return;
    
    this.line[lineIndex] = this.line[lineIndex].filter((entry) => {
      if (typeof player === 'number') {
        return entry.id !== player;
      } else {
        return entry.id !== player.id;
      }
    });

    return this;
  }

  findMatch(player: Player) {
    return new Promise<[Player, Player]>((resolve, reject) => {
      const {lineIndex} = player;
      if (lineIndex === null) return reject(null);
      let checkedLineIndex: {[index: number]: boolean} = {};
      let opponent: undefined | Player;
      let indiceOnLine = Object.keys(this.line);
      
      const getNearestIndexNotChecked = (): number => {
        let result = -1;
        const sortedByIndexDiff = indiceOnLine.map((index: string) => {
          const indexNum = Number(index);
          const diff = Math.abs(indexNum - lineIndex);
          return {
            index: indexNum,
            diff,
          }
        }).sort((a, b) => a.diff - b.diff);

        for (let i = 0; i < sortedByIndexDiff.length; i += 1) {
          const ele = sortedByIndexDiff[i];
          if (!checkedLineIndex[ele.index]) {
            result = ele.index;
          }
        }

        return result;
      }

      while (!opponent && Object.keys(checkedLineIndex).length !== indiceOnLine.length) {
        const indexToCheck = getNearestIndexNotChecked();
        const targetLine = this.line[indexToCheck];
        targetLine.forEach((entry) => {
          if (entry.id !== player.id) {
            opponent = entry;
          };
        })
        checkedLineIndex[indexToCheck] = true;
      }

      if (opponent) {
        opponent.sendPing();
        setTimeout(() => {
          if (opponent?.isAlive && !opponent.foundMatch) {
            this.delete(opponent);
            resolve([opponent, player])
          } else {
            opponent?.client.close();
            opponent?.deleteSelfFromWaitingLine();
            reject(null);
          }
        }, 1000)
      } else {
        reject(null);
      }
    })
  }
}

export default WaitingLine;