import { MapDesc } from "../routes/Model/GameRoom"

export enum SocketServerMessageTypes {
  SYNC_TIMER = 'SYNC_TIMER',
  SEND_ROOM = 'SEND_ROOM',
  ALERT_DOCK = 'ALERT_DOCK',
  DELETE_ROOM = 'DELETE_ROOM',
  ALERT_PREPARE = 'ALERT_PREPARE',
  SYNC_PREPARE_TIMER = 'SYNC_PREPARE_TIMER',
  INFORM_WINNER = 'INFORM_WINNER',
  ASK_REMATCH = 'ASK_REMATCH',
  CANCEL_REMATCH_ASK = 'CANCEL_REMATCH_ASK',
  ALERT_REMATCH_DECLINED = 'ALERT_REMATCH_DECLINED',
  INFORM_REMATCH_ACCEPTED = 'INFORM_REMATCH_ACCEPTED',
  INFORM_PREPARE_REMATCH = 'INFORM_PREPARE_REMATCH',
}

export type SyncTimerMessage = {
  type: SocketServerMessageTypes.SYNC_TIMER;
  payload: {
    leftTime: number;
  }
}

export type SendRoomMessage = {
  type: SocketServerMessageTypes.SEND_ROOM;
  payload: {
    map: number[][];
    mapDesc: MapDesc;
    roomId: number;
    playerData: {
      name: string;
      id: number;
    }[];
  }
}

export type AlertDockConstructor = {
  userId: number;
  stackIndex: number;
  action: 'DOCK' | 'UNDOCK';
}

export type AlertDockMessage = {
  type: SocketServerMessageTypes.ALERT_DOCK;
  payload: AlertDockConstructor;
}

export type DeleteRoom = {
  type: SocketServerMessageTypes.DELETE_ROOM;
}

export type AlertPrepare = {
  type: SocketServerMessageTypes.ALERT_PREPARE;
}

export type SyncPrepareTimer = {
  type: SocketServerMessageTypes.SYNC_PREPARE_TIMER;
  payload: {
    leftTime: number;
  }
}

export type InformWinner = {
  type: SocketServerMessageTypes.INFORM_WINNER;
  payload: {
    winner: number;
  }
}

export type AskRematch = {
  type: SocketServerMessageTypes.ASK_REMATCH,
}

export type CancelRematchAsk = {
  type: SocketServerMessageTypes.CANCEL_REMATCH_ASK,
}

export type AlertRematchDeclined = {
  type: SocketServerMessageTypes.ALERT_REMATCH_DECLINED,
}

export type InformRematchAccepted = {
  type: SocketServerMessageTypes.INFORM_REMATCH_ACCEPTED,
}

export type InformPrepareRematch = {
  type: SocketServerMessageTypes.INFORM_PREPARE_REMATCH,
}

export type SocketServerMessages =
  SyncTimerMessage
  | SendRoomMessage
  | AlertDockMessage
  | DeleteRoom
  | AlertPrepare
  | SyncPrepareTimer
  | InformWinner
  | AskRematch
  | CancelRematchAsk
  | AlertRematchDeclined
  | InformRematchAccepted
  | InformPrepareRematch