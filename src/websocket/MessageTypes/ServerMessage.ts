import { MapDesc } from "../routes/Model/GameRoom"

export enum SocketServerMessageTypes {
  SYNC_TIMER = 'SYNC_TIMER',
  SEND_ROOM = 'SEND_ROOM',
  ALERT_DOCK = 'ALERT_DOCK',
  DELETE_ROOM = 'DELETE_ROOM',
  ALERT_PREPARE = 'ALERT_PREPARE',
  SYNC_PREPARE_TIMER = 'SYNC_PREPARE_TIMER',
  INFORM_WINNER = 'INFORM_WINNER',
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

export type SocketServerMessages =
  SyncTimerMessage
  | SendRoomMessage
  | AlertDockMessage
  | DeleteRoom
  | AlertPrepare
  | SyncPrepareTimer
  | InformWinner