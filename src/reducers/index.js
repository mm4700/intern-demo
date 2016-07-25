import {combineReducers} from 'redux';
import {routerStateReducer} from 'redux-router';
import data from './data';
import chart from './chart';
import events from './events';

export default combineReducers({
  data,
  chart,
  events,
  router: routerStateReducer
});