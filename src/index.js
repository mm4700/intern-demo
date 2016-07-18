/*eslint-disable import/default*/
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Root from './containers/Root';
import configureStore from './store/configureStore';

const target = document.getElementById('root');
const store = configureStore(window.__INITIAL_STATE__);

const node = (
  <Root store={store} />
);

ReactDOM.render(node, target);