import type { ApplicationData } from '../reducers/cache';
import { CacheNames } from '../reducers/cache';
import type { Dispatch, GetState, ThunkAction } from '../reducers/types';
import { markCompleted } from './cache';
import { sleep, timeout } from '../utils/async';
import type { Configuration } from '../reducers/configuration';
import type { dataStateType, OverviewDataEntry } from '../reducers/data';
import electronObjects from '../store/electronObjects';
import ElectronUtilsRedux from '../utils/electronUtilsRedux';
import {
  popFlatFromQueue,
  returnToSearchPage,
  setBotIsActing,
  setBotMessage,
  setShowOverlay,
  taskFinished
} from './bot';
import performApplication from '../utils/performApplication';
import { abortable } from '../utils/generators';
import { printToPDF } from './helpers';
import AbortionSystem, {
  ABORTION_ERROR,
  ABORTION_MANUAL
} from '../utils/abortionSystem';
import { logger } from '../utils/tracer-logger.js';

export const endApplicationProcess =
  (): ThunkAction => async (dispatch: Dispatch) => {
    logger.info('End application process...');
    dispatch(returnToSearchPage());
    dispatch(setBotMessage(null));
    dispatch(taskFinished());
    await sleep(5000);
    // this kicks of next queued action, if any (?? — shouldn't this be caused by the page load caused in by `returnToSearchPage`)
    dispatch(setBotIsActing(false));
    dispatch(setShowOverlay(true));
  };

export const generateApplicationTextAndSubmit =
  (flatId: string): ThunkAction =>
  async (dispatch: Dispatch, getState: GetState) => {
    logger.trace('generateApplicationTextAndSubmit');
    const {
      configuration,
      data
    }: {
      configuration: Configuration;
      data: dataStateType;
    } = getState();
    const { webContents } = electronObjects.views.puppet;
    const electronUtils = new ElectronUtilsRedux(webContents, dispatch);
    const pdfPath: string = await dispatch(printToPDF(flatId));
    const { abortableAction: abortablePerformApplication, abort } =
      abortable(performApplication);
    AbortionSystem.registerAbort(abort);
    let success;
    let reason;

    logger.debug(`Start abortable application (flatId=${flatId})`);
    try {
      await timeout(
        abortablePerformApplication(
          dispatch,
          electronUtils,
          configuration,
          data.overview[flatId]
        ),
        // extracting this number to a variable leads to errors
        // TypeError: p is not a function
        300_000
      );
      success = true;
    } catch (error) {
      logger.error(`Error in application: [${error.name}] ${error.message}`);
      success = false;
      AbortionSystem.abort(ABORTION_ERROR);
      reason = error.message;
    }
    logger.debug(`End abortable application (flatId=${flatId})`);

    if (AbortionSystem.abortionReason !== ABORTION_MANUAL) {
      dispatch(popFlatFromQueue(flatId));
      await dispatch(
        markCompleted(CacheNames.APPLICATIONS, flatId, {
          flatId,
          success,
          addressDescription: data.overview[flatId].address.description,
          reason,
          pdfPath
        })
      );
    }

    await dispatch(endApplicationProcess());
  };

export const discardApplicationProcess =
  (flatOverview: OverviewDataEntry): ThunkAction =>
  async (dispatch: Dispatch) => {
    logger.trace('discardApplicationProcess');
    dispatch(setBotMessage(`Wohnung ist leider unpassend :(`));
    await sleep(5000);
    dispatch(popFlatFromQueue(flatOverview.id));
    await dispatch(
      markCompleted(CacheNames.APPLICATIONS, flatOverview.id, {
        flatId: flatOverview.id,
        success: false,
        addressDescription: flatOverview.address.description,
        reason: 'UNSUITABLE' // this won't show up in the sidebar
      })
    );
    await dispatch(endApplicationProcess());
  };
