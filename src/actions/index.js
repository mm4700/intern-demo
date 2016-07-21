import { checkHttpStatus } from '../utils';
import {
  FETCH_DATA_REQUEST,
  RECEIVE_DATA,
  CONFIGURE_CHART,
} from '../constants';
import { pushState } from 'redux-router';
import Promise from 'bluebird';
import superAgent from 'superagent';
import superAgentPromise from 'superagent-promise';

const agent = superAgentPromise(superAgent, Promise);

export function receiveData(data) {
  return {
    type: RECEIVE_DATA,
    payload: {
      data: data
    }
  };
}

export function fetchDataRequest() {
  return {
    type: FETCH_DATA_REQUEST
  };
}

export function fetchData(opts) {
  return (dispatch, state) => {
    dispatch(fetchDataRequest());
    return fetch('http://localhost:5001/api/v1/dataset?datasets=' + opts.opdatasets + '&well=' + opts.filters.well + '&startDate=' + opts.filters.startDate + '&endDate=' + opts.filters.endDate + '&aggregation=' + opts.filters.aggregation + '&grouping=' + opts.filters.grouping)
      .then(checkHttpStatus)
      .then(response => {
        dispatch(receiveData(response.data));
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
