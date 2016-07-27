import _ from 'lodash';
import { createReducer } from '../utils';
import {
  RECEIVE_MEASUREMENTS,
  FETCH_MEASUREMENTS_REQUEST
} from '../constants';

const initialState = {
  data: null,
  isFetching: false
};

export default createReducer(initialState, {
  [RECEIVE_MEASUREMENTS]: (state, payload) => {
    return Object.assign({}, state, {
      'data': payload.data,
      'isFetching': false
    });
  },
  [FETCH_MEASUREMENTS_REQUEST]: (state, payload) => {
    return Object.assign({}, state, {
      'isFetching': true
    });
  }
});