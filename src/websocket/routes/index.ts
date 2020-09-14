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
  if (parsedMessage.type === MessageTypes.ENTER) {
    const {userId, name} = parsedMessage.payload;
    const newPlayer = new Player({
      id: userId,
      ws,
      name,
    })

    await waitingLine
      .add(newPlayer)
      .findMatch(newPlayer)
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
      if (player.id !== userId && gameRoom.gameDuration - gameRoom.leftTime >= 30) {
        winner = userId;
      } else if (player.id === userId) {
        player.hasLeftGame = true;
      }
    });

    if (winner !== -1) {
      gameRoom?.checkWinner(winner);
    }

    let bothLeft = true;
    gameRoom?.forEachPlayer((player) => {
      if (!player.hasLeftGame) {
        bothLeft = false;
      }
    })
    
    gameRoom?.endGame();

    if (bothLeft) {
      gameRoom?.terminateConnections();
      delete rooms[roomId];
    }
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

  if (parsedMessage.type === MessageTypes.SUCCESS) {
    const {userId, roomId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.checkWinner(userId);
    gameRoom?.informWinner();
    gameRoom?.stopTimer();
  }

  if (parsedMessage.type === MessageTypes.REQUEST_REMATCH) {
    const { userId, roomId } = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    let recipient = -1;
    gameRoom?.forEachPlayer((player) => {
      if (player.id !== userId) {
        recipient = player.id;
      }
    })

    if (recipient !== -1) {
      gameRoom?.askRematch(recipient);
    }
  }

  if (parsedMessage.type === MessageTypes.CANCEL_REQUEST_REMATCH) {
    const { userId, roomId } = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    let recipient = -1;
    gameRoom?.forEachPlayer((player) => {
      if (player.id !== userId) {
        recipient = player.id;
      }
    })

    if (recipient !== -1) {
      gameRoom?.cancelRematchAsk(recipient);
    }
  }

  if (parsedMessage.type === MessageTypes.DECLINE_REQUEST_REMATCH) {
    const { userId, roomId } = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    let recipient = -1;
    gameRoom?.forEachPlayer((player) => {
      if (player.id !== userId) {
        recipient = player.id;
      }
    })

    if (recipient !== -1) {
      gameRoom?.alertRematchDeclined(recipient);
    }
  }

  if (parsedMessage.type === MessageTypes.ACCEPT_REMATCH) {
    const { userId, roomId } = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    let recipient = -1;
    gameRoom?.forEachPlayer((player) => {
      player.receivedMap = false;
      if (player.id !== userId) {
        recipient = player.id;
      }
    })

    if (recipient !== -1) {
      gameRoom?.informRematchAccepted(recipient);
      gameRoom?.resetGameRoom();
      gameRoom?.generateMap()
      .then(() => {
        gameRoom.sendRoomData();
      });
    }
  }

  if (parsedMessage.type === MessageTypes.INFORM_RECEIVED_MAP) {
    const { userId, roomId } = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    let bothReceivedMap = true;
    gameRoom?.forEachPlayer((player) => {
      if (player.id === userId) {
        player.receivedMap = true;
      }
      if (!player.receivedMap) {
        bothReceivedMap = false;
      }
    })

    if (bothReceivedMap) {
      gameRoom?.informPrepareRematch();
    }
  }

  if (parsedMessage.type === MessageTypes.REQUEST_OTHERMATCH) {
    const { userId, roomId } = parsedMessage.payload;
    const gameRoom = rooms[roomId];
  }

  if (parsedMessage.type === MessageTypes.CANCEL_REQUEST_OTHERMATCH) {
    const { userId, roomId } = parsedMessage.payload;
    const gameRoom = rooms[roomId];
  }

  console.log(parsedMessage);
  // console.log(waitingLine);
  // console.log(rooms);
}

export default baseController;