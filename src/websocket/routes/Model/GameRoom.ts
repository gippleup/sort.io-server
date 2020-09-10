import Ws from 'ws';
import Player from "./Player";
import generateMultiMap from "../utils/generateMultiMap";
import * as socketAction from '../../action/creator';
import { MapOption } from '../../../algo/generateMap';
import { getRepository } from 'typeorm';
import { MultiPlay } from '../../../entity/MultiPlay';

export type MapDesc = MapOption & { difficulty: number };

class GameRoom {
  roomId: number | undefined;
  players: Player[] = [];
  winner: number = -1;
  createdAt: string | undefined;
  map: number[][];
  mapDesc: MapDesc;
  gameDuration: number = 120;
  interval: NodeJS.Timer | undefined;
  leftTime: number = this.gameDuration;
  leftPrepareTime: number = 3;
  prepareTimer: NodeJS.Timer | undefined;
  fps: number = 1;
  constructor(player1: Player, player2: Player) {
    this.players.push(player1, player2);
    this.createdAt = new Date(Date.now()).toUTCString();
    const {question, desc} = generateMultiMap(1); // TODO: set difficulty by comparing player1,2 level;
    this.map = question;
    this.mapDesc = desc;
    this.roomId = GameRoom.count;
    GameRoom.count += 1;

    this.forEachClient = this.forEachClient.bind(this);
    this.forEachPlayer = this.forEachPlayer.bind(this);
    this.sendRoomData = this.sendRoomData.bind(this);
    this.checkPlayerIsReady = this.checkPlayerIsReady.bind(this);
    this.checkIfBothPlayerIsReady = this.checkIfBothPlayerIsReady.bind(this);
    this.alertPrepare = this.alertPrepare.bind(this);
    this.startPrepareTimer = this.startPrepareTimer.bind(this);
    this.onPrepareTimerInterval = this.onPrepareTimerInterval.bind(this);
    this.onPrepareTimerTimeout = this.onPrepareTimerTimeout.bind(this);
    this.stopPrepareTimer = this.stopPrepareTimer.bind(this);
    this.startGame = this.startGame.bind(this);
    this.onTimeout = this.onTimeout.bind(this);
    this.onTimerInterval = this.onTimerInterval.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.restartTimer = this.restartTimer.bind(this);
    this.updateScore = this.updateScore.bind(this);
    this.checkWinner = this.checkWinner.bind(this);
    this.informWinner = this.informWinner.bind(this);
    this.alertDockAction = this.alertDockAction.bind(this);
    this.saveResult = this.saveResult.bind(this);
    this.endGame = this.endGame.bind(this);
    this.terminateConnections = this.terminateConnections.bind(this);
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

  sendRoomData() {
    const {map, mapDesc, roomId} = this;
    if (!map || !mapDesc || roomId === undefined) return;
    this.forEachClient((client) => {
      client.send(socketAction.sendRoom({
        map,
        mapDesc,
        roomId,
      }));
    })
  }

  checkPlayerIsPrepared(userId: number) {
    this.forEachPlayer((player) => {
      if (player.id === userId) {
        player.isPrepared = true;
      }
    })
  }

  checkIfBothPlayerIsPrepared() {
    let result = true;
    this.forEachPlayer((player) => {
      if (!player.isPrepared) {
        result = false;
      }
    })
    return result;
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
    if (this.leftTime <= 0) {
      this.onTimeout();
    }
    this.forEachClient((client) => {
      client.send(socketAction.syncTimer(this.leftTime));
    })

    this.leftTime -= 1 / this.fps;
  }

  alertPrepare() {
    this.forEachClient((client) => {
      client.send(socketAction.alertPrepare());
    })
  }

  onPrepareTimerInterval(){
    if (this.leftPrepareTime <= 0) {
      this.onPrepareTimerTimeout();
    }
    this.forEachClient((client) => {
      client.send(socketAction.syncPrepareTimer(this.leftPrepareTime))
    })

    this.leftPrepareTime -= 1 / this.fps;
  }

  onPrepareTimerTimeout() {
    this.stopPrepareTimer();
    this.startGame();
  }

  startPrepareTimer() {
    this.prepareTimer = setInterval(this.onPrepareTimerInterval, 1000 / this.fps)
  }

  stopPrepareTimer() {
    if (this.prepareTimer !== undefined) {
      clearInterval(this.prepareTimer);
      this.prepareTimer = undefined;
    }
  }

  startTimer(initialTime = 120) {
    this.leftTime = initialTime;
    this.interval = setInterval(this.onTimerInterval, 1000 / this.fps);
  }

  stopTimer() {
    if (this.interval !== undefined) {
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

  checkWinner(winner?: number) {
    if (winner) {
      this.winner = winner;
    } else {
      let requiredScore = this.mapDesc.maxScore;
      this.forEachPlayer((player) => {
        if (!this.winner && player.score === requiredScore) {
          this.winner = player.id;
        }
      })
    }
    return this.winner;
  }

  alertDockAction(userId: number, stackIndex: number, action: 'DOCK' | 'UNDOCK') {
    this.forEachPlayer((player) => {
      if (player.id !== userId) {
        player.client.send(socketAction.alertDock({
          userId,
          stackIndex,
          action,
        }))
      }
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

  informWinner() {
    this.forEachClient((client) => {
      client.send(socketAction.informWinner(this.winner))
    })
  }

  endGame() {
    this.saveResult()
  }

  terminateConnections() {
    this.forEachClient((client) => {
      client.send(socketAction.deleteRoom());
      client.terminate();
    })
  }

  static count = 0;
}

export default GameRoom;