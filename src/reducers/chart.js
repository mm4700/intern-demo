import _ from 'lodash';
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
      startDate: '01/01/2016 00:00:00',
      endDate: '01/14/2016 23:59:59',
      wells: [true, true, true, true, true, true, true, true, true, true],
      aggregate: 'daily',
    },
    styles: {
      uncertainity: {
        strokeWidth: 1,
        strokeColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      uncertainityBounds: {
        strokeWidth: 1,
        strokeColor: {
          r: '159',
          g: '164',
          b: '123',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      uncertainityBand: {
        strokeWidth: 1,
        strokeColor: {
          r: '70',
          g: '80',
          b: '133',
          a: '1',
        },
        dashArray: 'none',
        fill: {
          r: '0',
          g: '205',
          b: '161',
          a: '0.8',
        },
        interpolation: 'basis',
      },
      measurements: {
        strokeWidth: 1,
        strokeColor: {
          r: '186',
          g: '188',
          b: '148',
          a: '1',
        },
        fill: '#fff'
      },
      flowRate: {
        strokeWidth: 1,
        strokeColor: {
          r: '146',
          g: '205',
          b: '0',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      }
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
    return Object.assign({}, state, _.merge(state, payload));
  }
});