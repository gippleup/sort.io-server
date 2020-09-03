export enum SortIoSocketMessageTypes {
  ENTER = 'ENTER',
  DOCK = 'DOCK',
  EXIT = 'EXIT',
  UNDOCK = 'UNDOCK',
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


export type SortIoSocketMessage =
  EnterMessage
  | DockMessage
  | UndockMessage