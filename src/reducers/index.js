import {combineReducers} from 'redux';
import {routerStateReducer} from 'redux-router';
import data from './data';
import chart from './chart';
import events from './events';
import measurements from './measurements';

export default combineReducers({
  data,
  chart,
  measurements,
  events,
  router: routerStateReducer
});