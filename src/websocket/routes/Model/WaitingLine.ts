import Player from "./Player";
import mergeSort from "../utils/mergeSort";

class WaitingLine {
  line: Player[] = [];

  constructor() {}

  add(player: Player) {
    this.line.push(player);
    return this;
  }

  findMatch(player: Player) {
    return new Promise<[Player, Player]>((resolve, reject) => {
      const opponent = this.line.pop();
      if (opponent) {
        resolve ([opponent, player]);
      } else {
        reject(null);
      }
    })
  }
}

export default WaitingLine;