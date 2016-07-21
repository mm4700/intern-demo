import {combineReducers} from 'redux';
import {routerStateReducer} from 'redux-router';
import data from './data';
import chart from './chart';

export default combineReducers({
  data,
  chart,
  router: routerStateReducer
});