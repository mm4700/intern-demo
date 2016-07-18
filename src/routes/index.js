import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from '../containers/App';
import * as views from '../views';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={views.HomeView} />
    <Route path="about" component={views.AboutView}/>
  </Route>
);
