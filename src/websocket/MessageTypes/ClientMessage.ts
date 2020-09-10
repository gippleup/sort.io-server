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
  ALERT_PREPARED = 'ALERT_PREPARED'
}

export type EnterMessage = {
  type: SocketClientMessageTypes.ENTER;
  payload: {
    userId: number;
  }
}

export type DockMessage = {
  type: SocketClientMessageTypes.DOCK;
  payload: {
    userId: number;
    roomId: number;
    stackIndex: number;
    action: 'DOCK' | 'UNDOCK';
  }
}

export type LoadedMessage = {
  type: SocketClientMessageTypes.LOADED,
  payload: {
    userId: number;
    roomId: number;
  }
}

export type UpdateScore = {
  type: SocketClientMessageTypes.UPDATE_SCORE,
  payload: {
    roomId: number;
    userId: number;
    score: number;
  }
}

export type AlertDisconnect = {
  type: SocketClientMessageTypes.ALERT_DISCONNECT,
  payload: {
    roomId: number;
    userId: number;
  }
}

export type SuccessMessage = {
  type: SocketClientMessageTypes.SUCCESS,
  payload: {
    roomId: number;
    userId: number;
  }
}

export type ExitMessage = {
  type: SocketClientMessageTypes.EXIT,
  payload: {
    roomId: number;
    userId: number;
  }
}

export type ReadyMessage = {
  type: SocketClientMessageTypes.ALERT_READY,
  payload: {
    roomId: number;
    userId: number;
  }
}

export type AlertPrepared = {
  type: SocketClientMessageTypes.ALERT_PREPARED,
  payload: {
    roomId: number;
    userId: number;
  }
}

export type SocketClientMessages =
  EnterMessage
  | DockMessage
  | LoadedMessage
  | UpdateScore
  | AlertDisconnect
  | ExitMessage
  | ReadyMessage
  | AlertPrepared
  | SuccessMessage