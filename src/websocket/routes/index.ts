import Ws from 'ws';
import {
  SortIoSocketMessage as SocketMessage,
  SortIoSocketMessageTypes as MessageTypes
} from './MessageTypes';
import WaitingLine from './Model/WaitingLine';
import Player from './Model/Player';
import GameRoom from './Model/GameRoom';

const waitingLine = new WaitingLine();
const rooms: {[index: number]: GameRoom} = {};

const baseController = async (message: Ws.Data, ws: Ws, wss: Ws.Server) => {
  if (typeof message !== "string") return;

  const parsedMessage: SocketMessage = JSON.parse(message);
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
          gameRoom.sendMap();
        }
      });
  }

  if (parsedMessage.type === MessageTypes.LOADED) {
    const {roomId, userId} = parsedMessage.payload;
    const gameRoom = rooms[roomId]
    gameRoom.checkPlayerIsReady(userId);
    const areBothReady = gameRoom.checkIfBothPlayerIsReady();
    if (areBothReady) {
      gameRoom.startGame();
    }
  }

  if (parsedMessage.type === MessageTypes.UPDATE_SCORE) {
    const {score, userId, roomId} = parsedMessage.payload;
    const gameRoom = rooms[roomId];
    gameRoom.updateScore(userId, score);
    const winner = gameRoom.checkWinner();
    if (winner) {
      gameRoom.endGame();
    }
  }
}

export default baseController;