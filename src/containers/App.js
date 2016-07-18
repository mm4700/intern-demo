import React, { Component, PropTypes } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

class App extends Component {
  render () {
    return (
      <div className="wrapper animsition has-footer" style={{animationDuration: '1.5s', opacity: 1}}>
        <Header/>
        <Sidebar/>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element
};

export default App
