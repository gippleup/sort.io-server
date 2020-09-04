import Ws from 'ws';
import Player from "./Player";
import generateMultiMap from "../utils/generateMultiMap";
import { loadMap, syncTimer, alertDock } from '../../action/creator';
import { MapOption } from '../../../algo/generateMap';
import { getRepository } from 'typeorm';
import { MultiPlay } from '../../../entity/MultiPlay';

class GameRoom {
  roomId: number | undefined;
  players: Player[] = [];
  winner: number = -1;
  createdAt: string | undefined;
  map: number[][];
  mapDesc: MapOption & {difficulty: number};
  gameDuration: number = 120;
  interval: NodeJS.Timer | undefined;
  leftTime: number = this.gameDuration;
  fps: number = 10;
  constructor(player1: Player, player2: Player) {
    this.players.push(player1, player2);
    this.createdAt = new Date(Date.now()).toUTCString();
    const {question, desc} = generateMultiMap(1);
    this.map = question;
    this.mapDesc = desc;
    this.roomId = GameRoom.count;
    GameRoom.count += 1;
  }

  forEachPlayer(callback: (player: Player) => any) {
    this.players.forEach(callback)
  }

  forEachClient(callback: (client: Ws) => any) {
    this.players.forEach((player) => {
      if (player.client) {
        callback(player.client)
      }
    })
  }

  sendMap() {
    const map = this.map;
    if (!map) return;
    this.forEachClient((client) => {
      client.send(loadMap(map));
    })
  }

  checkPlayerIsReady(userId: number) {
    this.forEachPlayer((player) => {
      if (player.id === userId) {
        player.isReady = true;
      }
    })
  }

  checkIfBothPlayerIsReady() {
    let result = true;
    this.forEachPlayer((player) => {
      if (!player.isReady) {
        result = false;
      }
    })
    return result;
  }

  startGame() {
    this.startTimer();
  }

  onTimeout() {
    this.stopTimer();
    this.endGame();
  }

  onTimerInterval() {
    this.forEachClient((client) => {
      client.send(syncTimer(this.leftTime))
    })

    this.leftTime -= 1 / this.fps;

    if (this.leftTime <= 0) {
      this.onTimeout();
    }
  }

  startTimer(initialTime = 120) {
    this.leftTime = initialTime;
    this.interval = setInterval(this.onTimerInterval, 1000 / this.fps);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  restartTimer() {
    this.startTimer(this.leftTime);
  }

  updateScore(userId: number, newScore: number) {
    this.forEachPlayer((player) => {
      if (player.id === userId) {
        player.score = newScore
      }
    })
  }

  checkWinner() {
    let requiredScore = this.mapDesc.maxScore;
    this.forEachPlayer((player) => {
      if (!this.winner && player.score === requiredScore) {
        this.winner = player.id;
      }
    })
    return this.winner;
  }

  alertDockAction(userId: number, stackIndex: number, action: 'DOCK' | 'UNDOCK') {
    this.forEachClient((client) => {
      client.send(alertDock({
        userId,
        stackIndex,
        action,
      }))
    })
  }

  saveResult() {
    return new Promise((resolve, reject) => {
      try {
        const multiRepo = getRepository(MultiPlay);
        const newData = new MultiPlay;
        newData.user1 = this.players[0].id;
        newData.user2 = this.players[1].id;
        newData.difficulty = this.mapDesc.difficulty;
        newData.timeConsumed = this.gameDuration - this.leftTime;
        newData.winner = this.winner;
        multiRepo.save(newData)
        .then((savedData) => {
          resolve(savedData);
        });
      } catch (e) {
        reject(e);
      }
    })
  }

  endGame() {
    this.saveResult()
    .then(this.terminateConnections);
  }

  terminateConnections() {
    this.forEachClient((client) => {
      client.terminate();
    })
  }

  static count = 0;
}

export default GameRoom;