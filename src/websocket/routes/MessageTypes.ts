export enum SortIoSocketMessageTypes {
  ENTER = 'ENTER',
  DOCK = 'DOCK',
  EXIT = 'EXIT',
  UNDOCK = 'UNDOCK',
  LOADED = 'LOADED',
  UPDATE_SCORE = 'UPDATE_SCORE',
}

export type EnterMessage = {
  type: SortIoSocketMessageTypes.ENTER;
  payload: {
    userId: number;
  }
}

export type DockMessage = {
  type: SortIoSocketMessageTypes.DOCK;
  payload: {
    userId: number;
    roomId: number;
    stackIndex: number;
  }
}

export type UndockMessage = {
  type: SortIoSocketMessageTypes.UNDOCK;
  payload: {
    userId: number;
    roomId: number;
    stackIndex: number;
  }
}

export type LoadedMessage = {
  type: SortIoSocketMessageTypes.LOADED,
  payload: {
    userId: number;
    roomId: number;
  }
}

export type UpdateScore = {
  type: SortIoSocketMessageTypes.UPDATE_SCORE,
  payload: {
    roomId: number;
    userId: number;
    score: number;
  }
}


export type SortIoSocketMessage =
  EnterMessage
  | DockMessage
  | UndockMessage
  | LoadedMessage
  | UpdateScore