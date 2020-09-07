import Player from "./Player";
import mergeSort from "../utils/mergeSort";

class WaitingLine {
  line: Player[] = [];

  constructor() {}

  add(player: Player) {
    this.line.push(player);
    return this;
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
      const opponents = this.line.filter((entry) => entry !== player);
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