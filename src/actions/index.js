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

export function fetchUncertainityData() {
  return (dispatch, state) => {
    dispatch(fetchUncertainityDataRequest());
    return fetch('http://localhost:5000/assets/data/uncertainity.csv')
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

export function fetchMeasurementsData() {
  return (dispatch, state) => {
    dispatch(fetchMeasurementsDataRequest());
    return fetch('http://localhost:5000/assets/data/measurements.csv')
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

export function fetchRatesData() {
  return (dispatch, state) => {
    dispatch(fetchRatesDataRequest());
    return fetch('http://localhost:5000/assets/data/rates.csv')
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
