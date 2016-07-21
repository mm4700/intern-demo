import { createReducer } from '../utils';
import {
  RECEIVE_DATA,
  FETCH_DATA_REQUEST
} from '../constants';

const initialState = {
  data: null,
  isFetching: false
};

export default createReducer(initialState, {
  [RECEIVE_DATA]: (state, payload) => {
    return Object.assign({}, state, {
      'data': payload.data,
      'isFetching': false
    });
  },
  [FETCH_DATA_REQUEST]: (state, payload) => {
    return Object.assign({}, state, {
      'isFetching': true
    });
  }
});