import { MapDesc } from "../routes/Model/GameRoom"

export enum SocketServerMessageTypes {
  SYNC_TIMER = 'SYNC_TIMER',
  SEND_ROOM = 'SEND_ROOM',
  INFORM_OPPONENT_HAS_LEFT = 'OPPONENT_HAS_LEFT',
  ALERT_DOCK = 'ALERT_DOCK',
  DELETE_ROOM = 'DELETE_ROOM',
  ALERT_PREPARE = 'ALERT_PREPARE',
  SYNC_PREPARE_TIMER = 'SYNC_PREPARE_TIMER',
  INFORM_WINNER = 'INFORM_WINNER',
  ASK_REMATCH = 'ASK_REMATCH',
  ALLOW_INFORM_REMATCH_REQUEST = 'ALLOW_INFORM_REMATCH_REQUEST',
  CANCEL_REMATCH_ASK = 'CANCEL_REMATCH_ASK',
  ALERT_REMATCH_DECLINED = 'ALERT_REMATCH_DECLINED',
  INFORM_REMATCH_ACCEPTED = 'INFORM_REMATCH_ACCEPTED',
  INFORM_PREPARE_REMATCH = 'INFORM_PREPARE_REMATCH',
  SEND_EXPRESSION_DATA = 'SEND_EXPRESSION_DATA',
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
      photo: string;
      skin: string;
    }[];
  }
}

export type InformOpponentHasLeft = {
  type: SocketServerMessageTypes.INFORM_OPPONENT_HAS_LEFT,
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

export type AllowInformRematchRequest = {
  type: SocketServerMessageTypes.ALLOW_INFORM_REMATCH_REQUEST,
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

export type SendExpressionData = {
  type: SocketServerMessageTypes.SEND_EXPRESSION_DATA,
  payload: {
    userId: number,
    expression: string,
  }
}

export type SocketServerMessages =
  SyncTimerMessage
  | SendRoomMessage
  | InformOpponentHasLeft
  | AlertDockMessage
  | DeleteRoom
  | AlertPrepare
  | SyncPrepareTimer
  | InformWinner
  | AskRematch
  | AllowInformRematchRequest
  | CancelRematchAsk
  | AlertRematchDeclined
  | InformRematchAccepted
  | InformPrepareRematch
  | SendExpressionData