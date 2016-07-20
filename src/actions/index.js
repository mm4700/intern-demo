import { checkHttpStatus } from '../utils';
import {
  FETCH_UNCERTAINITY_DATA_REQUEST,
  RECEIVE_UNCERTAINITY_DATA,
  FETCH_MEASUREMENTS_DATA_REQUEST,
  RECEIVE_MEASUREMENTS_DATA,
  FETCH_RATES_DATA_REQUEST,
  RECEIVE_RATES_DATA,
  CONFIGURE_CHART,
} from '../constants';
import { pushState } from 'redux-router';
import Promise from 'bluebird';
import superAgent from 'superagent';
import superAgentPromise from 'superagent-promise';

const agent = superAgentPromise(superAgent, Promise);

export function receiveUncertainityData(data) {
  return {
    type: RECEIVE_UNCERTAINITY_DATA,
    payload: {
      data: data
    }
  };
}

export function fetchUncertainityDataRequest() {
  return {
    type: FETCH_UNCERTAINITY_DATA_REQUEST
  };
}

export function fetchUncertainityData(opts) {
  return (dispatch, state) => {
    dispatch(fetchUncertainityDataRequest());
    return fetch('http://localhost:5001/api/v1/uncertainity?well=' + opts.well + '&startDate=' + opts.startDate + '&endDate=' + opts.endDate + '&aggregation=' + opts.aggregation + '&grouping=' + opts.grouping)
      .then(checkHttpStatus)
      .then(response => {
        dispatch(receiveUncertainityData(response.data));
      })
      .catch(error => {
        // @TODO
      });
  };
}

/// ------
export function receiveMeasurementsData(data) {
  return {
    type: RECEIVE_MEASUREMENTS_DATA,
    payload: {
      data: data
    }
  };
}

export function fetchMeasurementsDataRequest() {
  return {
    type: FETCH_MEASUREMENTS_DATA_REQUEST
  };
}

export function fetchMeasurementsData(opts) {
  return (dispatch, state) => {
    dispatch(fetchMeasurementsDataRequest());
    return fetch('http://localhost:5001/api/v1/measurements?well=' + opts.well + '&startDate=' + opts.startDate + '&endDate=' + opts.endDate + '&aggregation=' + opts.aggregation + '&grouping=' + opts.grouping)
      .then(checkHttpStatus)
      .then(response => {
        dispatch(receiveMeasurementsData(response.data));
      })
      .catch(error => {
        // @TODO
      });
  };
}

/// ------
export function receiveRatesData(data) {
  return {
    type: RECEIVE_RATES_DATA,
    payload: {
      data: data
    }
  };
}

export function fetchRatesDataRequest() {
  return {
    type: FETCH_RATES_DATA_REQUEST
  };
}

export function fetchRatesData(opts) {
  return (dispatch, state) => {
    dispatch(fetchRatesDataRequest());
    return fetch('http://localhost:5001/api/v1/flowrates?well=' + opts.well + '&startDate=' + opts.startDate + '&endDate=' + opts.endDate + '&aggregation=' + opts.aggregation + '&grouping=' + opts.grouping)
      .then(checkHttpStatus)
      .then(response => {
        dispatch(receiveRatesData(response.data));
      })
      .catch(error => {
        // @TODO
      });
  };
}

/// ------
export function configureChart(configuration) {
  return {
    type: CONFIGURE_CHART,
    payload: {
      configuration: configuration
    }
  };
}
