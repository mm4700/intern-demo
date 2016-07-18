import { createReducer } from '../utils';
import {
  RECEIVE_RATES_DATA,
  FETCH_RATES_DATA_REQUEST
} from '../constants';

const initialState = {
  data: null,
  isFetching: false
};

export default createReducer(initialState, {
  [RECEIVE_RATES_DATA]: (state, payload) => {
    return Object.assign({}, state, {
      'data': payload.data,
      'isFetching': false
    });
  },
  [FETCH_RATES_DATA_REQUEST]: (state, payload) => {
    return Object.assign({}, state, {
      'isFetching': true
    });
  }
});