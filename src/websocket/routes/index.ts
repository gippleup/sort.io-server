import Ws from 'ws';
import {
  SocketClientMessages as SocketMessage,
  SocketClientMessageTypes as MessageTypes
} from '../MessageTypes/ClientMessage';
import WaitingLine from './Model/WaitingLine';
import Player from './Model/Player';
import GameRoom from './Model/GameRoom';

export const waitingLine = new WaitingLine();
export const rooms: {[index: number]: GameRoom | undefined} = {};

const baseController = async (message: Ws.Data, ws: Ws, wss: Ws.Server) => {
  if (typeof message !== "string") return;

  const parsedMessage: SocketMessage = JSON.parse(message);
  if (parsedMessage.type === MessageTypes.ENTER) {
    const {userId, name, skin} = parsedMessage.payload;
    const newPlayer = new Player({
      id: userId,
      ws,
      name,
      skin,
    })

    await newPlayer.fetchProfileImg();
    waitingLine.add(newPlayer)
  }

  if (parsedMessage.type === MessageTypes.LOADED) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId]
    gameRoom?.checkPlayerAsReady(userId);
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
    if (winner !== -1) {
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
    const opponent = gameRoom?.getOpponent(userId);

    gameRoom?.checkPlayerAsLeft(userId);

    if (opponent) {
      gameRoom?.informOpponentHasLeft(userId);
    }

    waitingLine.delete(userId);
  }

  if (parsedMessage.type === MessageTypes.EXIT) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    let noOneLeftGameBefore = true;

    gameRoom?.forEachPlayer((player) => {
      if (player.hasLeftGame) {
        noOneLeftGameBefore = false;
      }
    })

    gameRoom?.forEachPlayer((player) => {
      if (player.id === userId) {
        player.hasLeftGame = true;
      }
    })

    if (noOneLeftGameBefore) {
      gameRoom?.stopTimer();
      gameRoom?.stopPrepareTimer();
      const opponent = gameRoom?.players.filter((P) => P.id !== userId)[0];
      const passedGoodTime = (gameRoom?.gameDuration || 0) - (gameRoom?.leftTime || 0) >= 30;
      if (opponent) {
        gameRoom?.informOpponentHasLeft(opponent.id);
        if (passedGoodTime) {
          gameRoom?.checkWinner(opponent.id);
          gameRoom?.endGame();
        }
      }
    }

    let bothLeft = gameRoom?.checkIfBothLeft();

    if (bothLeft) {
      gameRoom?.terminateConnections();
      delete rooms[roomId];
    }
  }

  if (parsedMessage.type === MessageTypes.ALERT_READY) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.stopGameIfSomeLeft();
    gameRoom?.checkPlayerAsReady(userId);
    const areBothReady = gameRoom?.checkIfBothPlayerIsReady();
    if (areBothReady) {
      gameRoom?.alertPrepare();
    }
  }

  if (parsedMessage.type === MessageTypes.ALERT_PREPARED) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.checkPlayerAsPrepared(userId);
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
    let player = gameRoom?.getPlayer(userId);
    let opponent = gameRoom?.getOpponent(userId);
    if (!player) {
    } else {
      if (!gameRoom?.rematchRequestOngoing) {
        if (opponent && !opponent?.hasLeftGame) {
          gameRoom?.allowInformRematchRequest(player.id);
          gameRoom?.askRematch(opponent.id);
        } else {
          gameRoom?.informOpponentHasLeft(player.id);
        }
      }
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
    const player = gameRoom?.getPlayer(userId);
    const opponent = gameRoom?.getOpponent(userId);

    gameRoom?.checkPlayerAsLeft(userId);

    if (player) {
      const newborn = new Player({
        id: player.id,
        name: player.name,
        ws: player.client,
        skin: player.skin,
      })

      waitingLine.add(newborn);
    }

    if (opponent) {
      gameRoom?.informOpponentHasLeft(opponent.id)
    }

    if (gameRoom?.checkIfBothLeft()) {
      gameRoom.deleteSelf();
    }
  }

  if (parsedMessage.type === MessageTypes.CANCEL_REQUEST_OTHERMATCH) {
    const { userId } = parsedMessage.payload;
    waitingLine.delete(userId);
  }

  if (parsedMessage.type === MessageTypes.EXPRESS_EMOTION) {
    const {expression, roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom?.sendExpressionData(userId, expression);
  }

  console.log(parsedMessage);
  // if (parsedMessage.type !== MessageTypes.DOCK) {
  //   console.log(waitingLine);
  // console.log('rooms', rooms);
  // }
}

export default baseController;