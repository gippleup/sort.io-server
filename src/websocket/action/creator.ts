import { MapDesc } from '../routes/Model/GameRoom';
import { SocketServerMessageTypes } from '../MessageTypes/ServerMessage';

type SendRoomParams = {
  map: number[][], mapDesc: MapDesc, roomId: number;
}

export const sendRoom = (param: SendRoomParams) => JSON.stringify({
  type: SocketServerMessageTypes.SEND_ROOM,
  payload: {
    map: param.map,
    mapDesc: param.mapDesc,
    roomId: param.roomId,
  }
})

export const syncTimer = (leftTime: number) => JSON.stringify({
  type: SocketServerMessageTypes.SYNC_TIMER,
  payload: {
    leftTime,
  }
})

type AlertDockConstructor = {
  userId: number;
  stackIndex: number;
  action: 'DOCK' | 'UNDOCK';
}
export const alertDock = (option: AlertDockConstructor) => JSON.stringify({
  type: SocketServerMessageTypes.ALERT_DOCK,
  payload: option,
})

export const deleteRoom = () => JSON.stringify({
  type: SocketServerMessageTypes.DELETE_ROOM,
})

export const alertPrepare = () => JSON.stringify({
  type: SocketServerMessageTypes.ALERT_PREPARE,
})

export const syncPrepareTimer = (leftTime: number) => JSON.stringify({
  type: SocketServerMessageTypes.SYNC_PREPARE_TIMER,
  payload: {
    leftTime,
  }
})