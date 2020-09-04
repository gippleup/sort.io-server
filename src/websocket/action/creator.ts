import * as Types from './type';

export const loadMap = (map: number[][]) => JSON.stringify({
  type: Types.LOAD_MAP,
  payload: {
    map,
  }
})

export const syncTimer = (leftTime: number) => JSON.stringify({
  type: Types.SYNC_TIMER,
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
  type: Types.ALERT_DOCK,
  payload: option,
})
