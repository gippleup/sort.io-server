import Ws from 'ws';
import Player from "./Player";
import generateMultiMap from "../utils/generateMultiMap";
import * as socketAction from '../../action/creator';
import { MapOption } from '../../../algo/generateMap';
import { getRepository } from 'typeorm';
import { MultiPlay } from '../../../entity/MultiPlay';
import { getMultiPlayRankByUserId } from '../../../utils/multiPlay';
import { rooms, waitingLine } from '../index';

export type MapDesc = MapOption & { difficulty: number };

class GameRoom {
  roomId: number;
  players: Player[] = [];
  winner: number = -1;
  createdAt: string | undefined;
  map: number[][] | undefined;
  mapDesc: MapDesc | undefined;
  gameDuration: number = 120;
  interval: NodeJS.Timer | undefined;
  leftTime: number = this.gameDuration;
  leftPrepareTime: number = 3;
  prepareTimer: NodeJS.Timer | undefined;
  fps: number = 1;
  rematchRequestOngoing: boolean = false;
  constructor (player1: Player, player2: Player) {
    this.players.push(player1, player2);
    this.createdAt = new Date(Date.now()).toUTCString();
    this.roomId = GameRoom.count;
    GameRoom.count += 1;

    this.forEachPlayer((player) => {
      player.addListener("close", () => {
        player.hasLeftGame = true;
        const opponent = this.players.filter((P) => P.id !== player.id)[0];
        this.stopTimer();
        this.stopPrepareTimer();
        this.informOpponentHasLeft(opponent.id);
        if (this.checkIfBothLeft()) {
          delete rooms[this.roomId];
        } 
      })
    })

    this.generateMap = this.generateMap.bind(this);
    this.decideDiffiulty = this.decideDiffiulty.bind(this);
    this.forEachClient = this.forEachClient.bind(this);
    this.forEachPlayer = this.forEachPlayer.bind(this);
    this.sendRoomData = this.sendRoomData.bind(this);
    this.killPlayerIfNoResponseAfter = this.killPlayerIfNoResponseAfter.bind(this);
    this.checkPlayerAsPrepared = this.checkPlayerAsPrepared.bind(this);
    this.checkPlayerAsLeft = this.checkPlayerAsLeft.bind(this);
    this.checkPlayerAsReady = this.checkPlayerAsReady.bind(this);
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
    this.resetTimers = this.resetTimers.bind(this);
    this.resetGameRoom = this.resetGameRoom.bind(this);
    this.updateScore = this.updateScore.bind(this);
    this.checkWinner = this.checkWinner.bind(this);
    this.informWinner = this.informWinner.bind(this);
    this.askRematch = this.askRematch.bind(this);
    this.cancelRematchAsk = this.cancelRematchAsk.bind(this);
    this.alertRematchDeclined = this.alertRematchDeclined.bind(this);
    this.alertDockAction = this.alertDockAction.bind(this);
    this.saveResult = this.saveResult.bind(this);
    this.endGame = this.endGame.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.getOpponent = this.getOpponent.bind(this);
    this.terminateConnections = this.terminateConnections.bind(this);
  }

  deleteSelf() {
    delete rooms[this.roomId];
  }

  async decideDiffiulty() {
    const tasks = this.players.map((player) => {
      return getMultiPlayRankByUserId(player.id)
      .then((data) => {
        if (data?.targetUser) {
          return data.targetUser.KBI
        } else {
          return 0
        }
      })
    });
    const KBI = await Promise.all(tasks);
    const minKBI = KBI.reduce((acc, ele) => {
      if (acc > ele) return ele;
      return acc;
    }, 0)

    if (minKBI < 90) {
      return 1;
    } else if (minKBI < 150) {
      return 2;
    } else if (minKBI < 210) {
      return 3;
    } else if (minKBI < 240) {
      return 4;
    } else {
      return 5;
    }
  }

  generateMap() {
    return this.decideDiffiulty()
      .then((difficulty) => {
        const { question, desc } = generateMultiMap(difficulty);
        this.map = question;
        this.mapDesc = desc;
      })
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
    const playerData = this.players.map((player) => ({
      name: player.name,
      id: player.id,
    }))
    if (!map || !mapDesc || roomId === undefined) return;
    this.forEachClient((client) => {
      client.send(socketAction.sendRoom({
        map,
        mapDesc,
        roomId,
        playerData,
      }));
    })
  }

  checkPlayerAsPrepared(userId: number) {
    this.getPlayer(userId).isPrepared = true;
    this.killPlayerIfNoResponseAfter(userId);
  }

  checkPlayerAsReady(userId: number) {
    this.getPlayer(userId).isReady = true;
    this.killPlayerIfNoResponseAfter(userId);
  }

  checkPlayerAsLeft(userId: number) {
    this.getPlayer(userId).hasLeftGame = true;
  }

  killPlayerIfNoResponseAfter(userId: number, ms: number = 10000) {
    const player = this.getPlayer(userId);
    player.killIfNoResponseAfter(ms, (id) => {
      player.hasLeftGame = true;
      const opponent = this.players.filter((P) => P.id !== id)[0];
      this.informOpponentHasLeft(opponent.id);
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
    this.forEachPlayer((player) => player.cancelKillRequest());
    this.startTimer();
  }

  onTimeout() {
    this.stopTimer();
    // this.endGame();
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

  resetTimers() {
    this.stopTimer();
    this.stopPrepareTimer();
    this.leftTime = this.gameDuration;
    this.leftPrepareTime = 3;
  }

  resetGameRoom() {
    this.resetTimers();
    this.winner = -1;
    this.players.forEach((player) => player.reset())
    this.rematchRequestOngoing = false;
  }

  restartTimer() {
    this.startTimer(this.leftTime);
  }

  updateScore(userId: number, newScore: number) {
    this.getPlayer(userId).score = newScore;
  }

  informOpponentHasLeft(userId: number) {
    const message = socketAction.informOpponentHasLeft();
    this.getPlayer(userId).client.send(message)
  }

  checkWinner(winner?: number) {
    if (winner) {
      this.winner = winner;
    } else if (this.mapDesc) {
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
    const message = socketAction.alertDock({
      userId,
      stackIndex,
      action,
    });
    this.getOpponent(userId).client.send(message);
  }

  saveResult() {
    return new Promise((resolve, reject) => {
      try {
        const multiRepo = getRepository(MultiPlay);
        const newData = new MultiPlay;
        newData.user1 = this.players[0].id;
        newData.user2 = this.players[1].id;
        newData.difficulty = this.mapDesc?.difficulty || -1;
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
    this.saveResult();
  }

  askRematch(userId: number) {
    const message = socketAction.askRematch();
    this.getPlayer(userId).client.send(message);
  }

  allowInformRematchRequest(userId: number) {
    if (!this.rematchRequestOngoing) {
      const message = socketAction.allowInformRematchRequest();
      this.getPlayer(userId).client.send(message);
      this.rematchRequestOngoing = true;
    }
  }

  cancelRematchAsk(userId: number) {
    if (this.rematchRequestOngoing) {
      const message = socketAction.cancelRematchAsk();
      this.getPlayer(userId).client.send(message);
      this.rematchRequestOngoing = false;
    }
  }

  alertRematchDeclined(userId: number) {
    if (this.rematchRequestOngoing) {
      const message = socketAction.alertRematchDeclined();
      this.getPlayer(userId).client.send(message);
      this.rematchRequestOngoing = false;
    }
  }

  informRematchAccepted(userId: number) {
    const message = socketAction.informRematchAccepted();
    this.getPlayer(userId).client.send(message);
  }

  informPrepareRematch() {
    this.forEachClient((client) => {
      client.send(socketAction.informPrepareRematch());
    })
  }

  endGame() {
    this.saveResult()
  }

  checkIfBothLeft() {
    let bothLeft = true;
    this.forEachPlayer((player) => {
      if (!player.hasLeftGame) {
        bothLeft = false;
      }
    })
    return bothLeft;
  }

  getPlayer(userId: number) {
    let player = this.players.filter((player) => player.id === userId);
    return player[0];
  }

  getOpponent(userId: number) {
    let opponent = this.players.filter((player) => player.id !== userId);
    return opponent[0];
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