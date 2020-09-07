import Ws from 'ws';
import {
  SocketClientMessages as SocketMessage,
  SocketClientMessageTypes as MessageTypes
} from '../MessageTypes/ClientMessage';
import WaitingLine from './Model/WaitingLine';
import Player from './Model/Player';
import GameRoom from './Model/GameRoom';

const waitingLine = new WaitingLine();
const rooms: {[index: number]: GameRoom | undefined} = {};

const baseController = async (message: Ws.Data, ws: Ws, wss: Ws.Server) => {
  if (typeof message !== "string") return;

  const parsedMessage: SocketMessage = JSON.parse(message);
  console.log(parsedMessage);
  console.log(waitingLine.line.length, Object.keys(rooms).length)
  if (parsedMessage.type === MessageTypes.ENTER) {
    const {userId} = parsedMessage.payload;
    const newPlayer = new Player({
      id: userId,
      ws,
    })

    await waitingLine
      .add(newPlayer)
      .findMatch(newPlayer)
      .then((players) => {
        const [player1, player2] = players;
        const gameRoom = new GameRoom(player1, player2);
        if (gameRoom.roomId !== undefined) {
          rooms[gameRoom.roomId] = gameRoom;
          gameRoom.sendRoomData();
        }
      })
      .catch(() => {});
  }

  if (parsedMessage.type === MessageTypes.LOADED) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId]
    gameRoom?.checkPlayerIsReady(userId);
    const areBothReady = gameRoom?.checkIfBothPlayerIsReady();
    if (areBothReady) {
      gameRoom?.startGame();
    }
  }

  if (parsedMessage.type === MessageTypes.UPDATE_SCORE) {
    const {score, userId, roomId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.updateScore(userId, score);
    const winner = gameRoom?.checkWinner();
    if (winner) {
      gameRoom?.endGame();
    }
  }

  if (parsedMessage.type === MessageTypes.DOCK) {
    const {userId, action, roomId, stackIndex} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.alertDockAction(userId, stackIndex, action);
  }

  if (parsedMessage.type === MessageTypes.ALERT_DISCONNECT) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.terminateConnections();
    waitingLine.delete(userId);
    delete rooms[roomId];
  }

  if (parsedMessage.type === MessageTypes.EXIT) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    let winner = -1;
    gameRoom?.forEachPlayer((player) => {
      if (player.id !== userId) {
        winner = userId;
      }
    })
    gameRoom?.checkWinner(winner)
    gameRoom?.endGame();
  }

  if (parsedMessage.type === MessageTypes.ALERT_READY) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.checkPlayerIsReady(userId);
    const areBothReady = gameRoom?.checkIfBothPlayerIsReady();
    if (areBothReady) {
      gameRoom?.alertPrepare();
    }
  }

  if (parsedMessage.type === MessageTypes.ALERT_PREPARED) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.checkPlayerIsPrepared(userId);
    const areBothPrepared = gameRoom?.checkIfBothPlayerIsPrepared();
    if (areBothPrepared) {
      gameRoom?.startPrepareTimer();
    }
  }
}

export default baseController;