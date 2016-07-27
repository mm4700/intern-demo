import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import App from '../containers/App';
import * as views from '../views';

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="simulations" />
    <Route path="simulations" component={views.HomeView} />
    <Route path="events" component={views.EventsView} />
    <Route path="availability" component={views.AvailabilityView} />
    <Route path="about" component={views.AboutView}/>
  </Route>
);

