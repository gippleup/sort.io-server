import { MapDesc } from '../routes/Model/GameRoom';
import { SocketServerMessageTypes } from '../MessageTypes/ServerMessage';

type SendRoomParams = {
  map: number[][],
  mapDesc: MapDesc,
  roomId: number;
  playerData: {id: number, name: string}[];
}

export const sendRoom = (param: SendRoomParams) => JSON.stringify({
  type: SocketServerMessageTypes.SEND_ROOM,
  payload: param,
})

export const informOpponentHasLeft = (passedGoodTime: boolean) => JSON.stringify({
  type: SocketServerMessageTypes.INFORM_OPPONENT_HAS_LEFT,
  payload: passedGoodTime,
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

export const informWinner = (winner: number) => JSON.stringify({
  type: SocketServerMessageTypes.INFORM_WINNER,
  payload: {
    winner,
  }
})

export const askRematch = () => JSON.stringify({
  type: SocketServerMessageTypes.ASK_REMATCH,
})

export const allowInformRematchRequest = () => JSON.stringify({
  type: SocketServerMessageTypes.ALLOW_INFORM_REMATCH_REQUEST,
})

export const cancelRematchAsk = () => JSON.stringify({
  type: SocketServerMessageTypes.CANCEL_REMATCH_ASK
})

export const alertRematchDeclined = () => JSON.stringify({
  type: SocketServerMessageTypes.ALERT_REMATCH_DECLINED,
})

export const informRematchAccepted = () => JSON.stringify({
  type: SocketServerMessageTypes.INFORM_REMATCH_ACCEPTED,
})

export const informPrepareRematch = () => JSON.stringify({
  type: SocketServerMessageTypes.INFORM_PREPARE_REMATCH,
})

export const ping = () => JSON.stringify({
  type: SocketServerMessageTypes.PING,
})

type SendExpressionDataParam = {
  userId: number;
  expression: string;
}

export const sendExpressionData = (param: SendExpressionDataParam) => JSON.stringify({
  type: SocketServerMessageTypes.SEND_EXPRESSION_DATA,
  payload: param
})