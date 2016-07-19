import { createReducer } from '../utils';
import {
  CONFIGURE_CHART,
} from '../constants';

const initialState = {
  configuration: {
    opdatasets: {
      uncertainity: true,
      measurements: true,
      rates: true,
    },
    filters: {

    },
    styles: {

    },
    settings: {
      showLegend: false,
      showUncertainityBounds: true,
      showUncertainityBand: false,
      showEdgeCoordinates: true,
      enableTooltips: true,
      enableDataPointInteraction: false,
    }
  }
};

export default createReducer(initialState, {
  [CONFIGURE_CHART]: (state, payload) => {
    return Object.assign({}, state, {
      'configuration': payload.configuration
    });
  }
});