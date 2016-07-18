import React, { Component } from 'react';
import { Provider } from 'react-redux';
import routes from '../routes';
import { ReduxRouter } from 'redux-router';

export default class Root extends Component {
  render () {
    return (
      <div>
        <Provider store={this.props.store}>
          <div>
            <ReduxRouter>
            {routes}
            </ReduxRouter>
          </div>
        </Provider>
      </div>
    );
  }
}

Root.propTypes = {
  store: React.PropTypes.object.isRequired
};