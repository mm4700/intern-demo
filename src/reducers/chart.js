import _ from 'lodash';
import { createReducer } from '../utils';
import {
  CONFIGURE_CHART,
} from '../constants';

const initialState = {
  configuration: {
    opdatasets: {
      rp: true,
      bhp: true,
      whp: true,
      bht: true,
      wht: true,
      q: true,
    },
    filters: {
      startDate: '01/01/2015 00:00:00',
      endDate: '12/31/2015 23:59:59',
      well: 'Standard Draw 9-20-18-93',
      grouping: 'daily',
      aggregate: 'avg',
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
      stackCharts: false,
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