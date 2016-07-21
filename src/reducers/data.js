import _ from 'lodash';
import { createReducer } from '../utils';
import {
  RECEIVE_DATA,
  FETCH_DATA_REQUEST
} from '../constants';

const initialState = {
  data: {},
  isFetching: false
};

export default createReducer(initialState, {
  [RECEIVE_DATA]: (state, payload) => {
    let newData = Object.assign({}, state);
    newData.isFetching = false;
    console.log('newData', newData);
    Object.keys(payload.data).forEach(k => {
      newData.data[k] = payload.data[k];
    });
    console.log('newData', newData);

    return newData;
  },
  [FETCH_DATA_REQUEST]: (state, payload) => {
    return Object.assign({}, state, {
      'isFetching': true
    });
  }
});