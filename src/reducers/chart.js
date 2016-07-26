import _ from 'lodash';
import { createReducer } from '../utils';
import {
  CONFIGURE_CHART,
} from '../constants';

const initialState = {
  configuration: {
    opdatasets: {
      q: true,
      rp: true,
      bhp: true,
      whp: true,
      bht: true,
      wht: true,
    },
    filters: {
      startDate: '01/01/2015 00:00:00',
      endDate: '12/31/2015 23:59:59',
      well: 'Standard Draw 9-20-18-93',
      grouping: 'daily',
      aggregate: 'avg',
    },
    styles: {
      inferred: {
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
      inferredUpperBound: {
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
      inferredLowerBound: {
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
      inferredBand: {
        fillColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        interpolation: 'basis',
      },
      measurement: {
        strokeWidth: 1,
        strokeColor: {
          r: '226',
          g: '198',
          b: '218',
        },
        fillColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        dashArray: 'none',
        radius: 2.8,
      },
    },
    settings: {
      stackCharts: false,
      showLegend: false,
      showUncertainityBounds: true,
      showUncertainityBand: false,
      showEdgeCoordinates: true,
      enableTooltips: true,
      enableDataPointInteraction: false,
      enableZoomControl: false,
    }
  }
};

export default createReducer(initialState, {
  [CONFIGURE_CHART]: (state, payload) => {
    let newData = Object.assign({}, state);
    Object.keys(payload.configuration).forEach(k => {
      newData.configuration[k] = payload.configuration[k];
    });
    return newData;
  }
});