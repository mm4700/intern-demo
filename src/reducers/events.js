import _ from 'lodash';
import { createReducer } from '../utils';
import {
  RECEIVE_EVENTS,
  FETCH_EVENTS_REQUEST
} from '../constants';

const initialState = {
  events: null,
  isFetching: false
};

export default createReducer(initialState, {
  [RECEIVE_EVENTS]: (state, payload) => {
    return Object.assign({}, state, {
      'events': payload.data,
      'isFetching': false
    });
  },
  [FETCH_EVENTS_REQUEST]: (state, payload) => {
    return Object.assign({}, state, {
      'isFetching': true
    });
  }
});