import {combineReducers} from 'redux';
import {routerStateReducer} from 'redux-router';
import uncertainity from './uncertainity';
import measurements from './measurements';
import rates from './rates';
import chart from './chart';

export default combineReducers({
  uncertainity,
  measurements,
  rates,
  chart,
  router: routerStateReducer
});