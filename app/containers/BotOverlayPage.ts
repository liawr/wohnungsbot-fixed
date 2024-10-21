import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import BotOverlay from '../components/BotOverlay';
import { performScroll } from '../actions/electron';
import BoundingBoxGroups from '../constants/boundingBoxGroups';
import type { stateType } from '../reducers/types';

function mapStateToProps(state: stateType) {
  return {
    isPuppetLoading: !state.electron.views.puppet.ready,
    animations: state.overlay.animations,
    overviewBoundingBoxes: state.overlay.boundingBoxes.filter(
      ({ group }) => group === BoundingBoxGroups.OVERVIEW
    ),
    verdicts: state.data.verdicts,
    isBotActing: state.bot.isActive,
    botMessage: state.bot.message,
    showOverlay: state.bot.showOverlay,
    alreadyAppliedFlatIds: Object.entries(state.cache.applications)
      .filter(([_, application]) => application.reason !== 'UNSUITABLE')
      .map(([flatId]) => flatId),
    unsuitableFlatIds: Object.entries(state.cache.applications)
      .filter(([_, application]) => application.reason === 'UNSUITABLE')
      .map(([flatId]) => flatId)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      performScroll
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(BotOverlay);
