import Ws from 'ws';
import {
  SortIoSocketMessage as SocketMessage,
  SortIoSocketMessageTypes as MessageTypes
} from './DataTypes';
import generateMap from '../../algo/generateMap';

type Player = {
  client: Ws;
  id: number;
}

type Room = {
  roomId: number;
  players: Player[];
  winner: number | null;
  createdAt: string;
  map: number[][];
}

type RoomData = Record<'waiting' | 'playing', {[index: number]: Room}>;

const room: RoomData = {
  waiting: {},
  playing: {},
};

let roomCount = 0;

const baseController = (message: Ws.Data, ws: Ws, wss: Ws.Server) => {
  if (typeof message === "string") {
    const parsedMessage: SocketMessage = JSON.parse(message);
    if (parsedMessage.type === MessageTypes.ENTER) {
      if (!Object.values(room.waiting).length) {
        room.waiting[roomCount] = {
          createdAt: new Date(Date.now()).toUTCString(),
          players: [{
            client: ws,
            id: parsedMessage.payload.userId,
          }],
          roomId: roomCount,
          winner: null,
          map: generateMap({
            blockStackCount: 12,
            colorCount: 11,
            maxScore: 11,
            stackLengthMax: 8,
            stackLengthMin: 5,
            shuffleCount: 1000,
          }).question
        }
        roomCount += 1;
      } else {
        const waitingRooms = Object.values(room.waiting);
        const oldestRoom = waitingRooms[0];
        const isNewUser = oldestRoom.players
          .reduce((acc, player) => {
            if (player.id !== parsedMessage.payload.userId) {
              return true;
            }
            return acc;
          }, false)

        if (isNewUser) {
          oldestRoom.players.push({
            client: ws,
            id: parsedMessage.payload.userId,
          });
          delete room.waiting[oldestRoom.roomId];
          room.playing[oldestRoom.roomId] = oldestRoom;
        }

        if (oldestRoom.players.length === 2) {
          oldestRoom.players.forEach((player) => {
            player.client.send(JSON.stringify({
              type: 'MATCH',
              payload: {
                roomId: oldestRoom.roomId,
                map: oldestRoom.map
              }
            }));
          })
        }
      }
    } else if (parsedMessage.type === MessageTypes.UNDOCK
      || parsedMessage.type === MessageTypes.DOCK) {
      const {roomId} = parsedMessage.payload;
      room.playing[roomId].players.forEach((player) => {
        player.client.send(message)
      })
    }
  }
}

export default baseController;