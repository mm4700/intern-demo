import { createReducer } from '../utils';
import {
  CONFIGURE_CHART,
} from '../constants';

const initialState = {
  configuration: null
};

export default createReducer(initialState, {
  [CONFIGURE_CHART]: (state, payload) => {
    return Object.assign({}, state, {
      'configuration': payload.configuration
    });
  }
});