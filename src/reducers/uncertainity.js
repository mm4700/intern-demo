import { createReducer } from '../utils';
import {
  RECEIVE_UNCERTAINITY_DATA,
  FETCH_UNCERTAINITY_DATA_REQUEST
} from '../constants';

const initialState = {
  data: null,
  isFetching: false
};

export default createReducer(initialState, {
  [RECEIVE_UNCERTAINITY_DATA]: (state, payload) => {
    return Object.assign({}, state, {
      'data': payload.data,
      'isFetching': false
    });
  },
  [FETCH_UNCERTAINITY_DATA_REQUEST]: (state, payload) => {
    return Object.assign({}, state, {
      'isFetching': true
    });
  }
});