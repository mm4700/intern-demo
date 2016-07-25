import { checkHttpStatus } from '../utils';
import {
  FETCH_DATA_REQUEST,
  RECEIVE_DATA,
  CONFIGURE_CHART,
  RECEIVE_EVENTS,
  FETCH_EVENTS_REQUEST,
} from '../constants';
import { pushState } from 'redux-router';
import Promise from 'bluebird';
import agent from 'superagent';
import moment from 'moment';

export function receiveData(dataset, data) {
  let newData = {};
  newData[dataset] = data;
  return {
    type: RECEIVE_DATA,
    payload: {
      data: newData
    }
  };
}

export function fetchDataRequest() {
  return {
    type: FETCH_DATA_REQUEST
  };
}

export function fetchData(dataset, opts) {
  return (dispatch, state) => {
    dispatch(fetchDataRequest());
    const data = { well: opts.filters.well, startDate: moment(opts.filters.startDate, 'MM/DD/YYYY HH:mm').valueOf(), endDate: moment(opts.filters.endDate, 'MM/DD/YYYY HH:mm').valueOf(), grouping: opts.filters.grouping, aggregate: opts.filters.aggregate };
    return new Promise((resolve, reject) => {
      agent.post('http://localhost:5001/api/v1/data/' + dataset)
        .send(data)
        .set('Accept', 'application/json')
        .end((err, response) => {
          if (err) {
            return reject(err);
          }

          dispatch(receiveData(dataset, response.body));
          resolve();
        })
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

// ------
export function receiveEvents(data) {
  return {
    type: RECEIVE_EVENTS,
    payload: {
      data: data
    }
  };
}

export function fetchEventsRequest() {
  return {
    type: FETCH_EVENTS_REQUEST
  };
}

export function fetchEvents(opts) {
  return (dispatch, state) => {
    dispatch(fetchDataRequest());
    const data = { startDate: moment(opts.filters.startDate, 'MM/DD/YYYY HH:mm').valueOf(), endDate: moment(opts.filters.endDate, 'MM/DD/YYYY HH:mm').valueOf(), grouping: opts.filters.grouping };
    return new Promise((resolve, reject) => {
      agent.post('http://localhost:5001/api/v1/events')
        .send(data)
        .set('Accept', 'application/json')
        .end((err, response) => {
          if (err) {
            return reject(err);
          }

          dispatch(receiveEvents(response.body));
          resolve();
        })
      });
  };
}
