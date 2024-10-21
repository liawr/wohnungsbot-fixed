import type { Store as ReduxStore } from 'redux';
import type { electronStateType } from './electron';
import type { overlayStateType } from './overlay';
import type { dataStateType } from './data';
import type { Configuration } from './configuration';
import type { cacheStateType } from './cache';
import type { schedulerStateType } from './scheduler';
import type { botStateType } from './bot';

export type stateType = {
  electron: electronStateType;
  overlay: overlayStateType;
  data: dataStateType;
  configuration: Configuration;
  cache: cacheStateType;
  scheduler: schedulerStateType;
  bot: botStateType;
};
export type Action = {
  readonly type: string;
  payload?: any;
  meta?:
    | {
        scope?: string;
        target?: string;
      }
    | {
        queue: true;
        message: string;
      }
    | {
        cache: true;
      }
    | {
        configuration: true;
      };
};

// eslint-disable-next-line no-use-before-define
export type Dispatch = (action: Action | ThunkAction) => any;
export type GetState = () => stateType;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type Store = ReduxStore<stateType, Action>;
