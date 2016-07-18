import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleXsNav = this.handleXsNav.bind(this);
  }

  handleXsNav(ev) {
    ev.preventDefault();

    document.getElementById('root').classList.toggle('side-nav-shown');
  }

  render () {
    return (
      <div className="header-top navbar">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle side-nav-toggle" onClick={this.handleXsNav}>
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>

          <Link className="navbar-brand" to="/">U<span>ncertainty Demo</span></Link>
        </div>
        <div className="collapse navbar-collapse" id="headerNavbarCollapse">
        </div>
      </div>
    );
  }
}

export default Header;
