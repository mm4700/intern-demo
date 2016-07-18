import { createReducer } from '../utils';
import {
  RECEIVE_MEASUREMENTS_DATA,
  FETCH_MEASUREMENTS_DATA_REQUEST
} from '../constants';

const initialState = {
  data: null,
  isFetching: false
};

export default createReducer(initialState, {
  [RECEIVE_MEASUREMENTS_DATA]: (state, payload) => {
    return Object.assign({}, state, {
      'data': payload.data,
      'isFetching': false
    });
  },
  [FETCH_MEASUREMENTS_DATA_REQUEST]: (state, payload) => {
    return Object.assign({}, state, {
      'isFetching': true
    });
  }
});