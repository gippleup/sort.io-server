export enum SocketClientMessageTypes {
  ENTER = 'ENTER',
  DOCK = 'DOCK',
  EXIT = 'EXIT',
  UNDOCK = 'UNDOCK',
  LOADED = 'LOADED',
  UPDATE_SCORE = 'UPDATE_SCORE',
  ALERT_DISCONNECT = 'ALERT_DISCONNECT',
  SUCCESS = 'SUCCESS',
  ALERT_READY = 'ALERT_READY',
  ALERT_PREPARED = 'ALERT_PREPARED',
  REQUEST_REMATCH = 'REQUEST_REMATCH',
  CANCEL_REQUEST_REMATCH = 'CANCEL_REQUEST_REMATCH',
  DECLINE_REQUEST_REMATCH = 'DECLINE_REQUEST_REMATCH',
  ACCEPT_REMATCH = 'ACCEPT_REMATCH',
  REQUEST_OTHERMATCH = 'REQUEST_OTHERMATCH',
  CANCEL_REQUEST_OTHERMATCH = 'CANCEL_REQUEST_OTHERMATCH',
  INFORM_RECEIVED_MAP = 'INFORM_RECEIVED_MAP',
}

export type EnterMessage = {
  type: SocketClientMessageTypes.ENTER;
  payload: {
    userId: number;
    name: string;
  }
}

export type DockMessage = {
  type: SocketClientMessageTypes.DOCK;
  payload: BasicParam & {
    stackIndex: number;
    action: 'DOCK' | 'UNDOCK';
  }
}

type BasicParam = {
  userId: number;
  roomId: number;
}

export type LoadedMessage = {
  type: SocketClientMessageTypes.LOADED,
  payload: BasicParam
}

export type UpdateScore = {
  type: SocketClientMessageTypes.UPDATE_SCORE,
  payload: BasicParam & {
    score: number;
  }
}

export type AlertDisconnect = {
  type: SocketClientMessageTypes.ALERT_DISCONNECT,
  payload: BasicParam
}

export type SuccessMessage = {
  type: SocketClientMessageTypes.SUCCESS,
  payload: BasicParam
}

export type ExitMessage = {
  type: SocketClientMessageTypes.EXIT,
  payload: BasicParam
}

export type ReadyMessage = {
  type: SocketClientMessageTypes.ALERT_READY,
  payload: BasicParam
}

export type AlertPrepared = {
  type: SocketClientMessageTypes.ALERT_PREPARED,
  payload: BasicParam
}

export type RequestRematch = {
  type: SocketClientMessageTypes.REQUEST_REMATCH,
  payload: BasicParam
}

export type AcceptRematch = {
  type: SocketClientMessageTypes.ACCEPT_REMATCH,
  payload: BasicParam
}

export type RequestOtherRematch = {
  type: SocketClientMessageTypes.REQUEST_OTHERMATCH,
  payload: BasicParam
}

export type CancelRequestRematch = {
  type: SocketClientMessageTypes.CANCEL_REQUEST_REMATCH,
  payload: BasicParam
}

export type DeclineRequestRematch = {
  type: SocketClientMessageTypes.DECLINE_REQUEST_REMATCH,
  payload: BasicParam
}

export type InformReceivedMap = {
  type: SocketClientMessageTypes.INFORM_RECEIVED_MAP,
  payload: BasicParam
}

export type CancelRequestOtherMatch = {
  type: SocketClientMessageTypes.CANCEL_REQUEST_OTHERMATCH,
  payload: BasicParam
}

export type SocketClientMessages =
  EnterMessage
  | DockMessage
  | LoadedMessage
  | UpdateScore
  | AlertDisconnect
  | ExitMessage
  | SuccessMessage
  | ReadyMessage
  | AlertPrepared
  | RequestRematch
  | AcceptRematch
  | InformReceivedMap
  | RequestOtherRematch
  | CancelRequestRematch
  | CancelRequestOtherMatch
  | DeclineRequestRematch