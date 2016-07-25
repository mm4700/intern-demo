import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';

export class Sidebar extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      activeTab: null,
      activeView: 'simulations',
      q: true,
      rp: true,
      bhp: true,
      whp: true,
      bht: true,
      wht: true,
    };

    this.toggleMenuItem = this.toggleMenuItem.bind(this);
    this.toggleDataset = this.toggleDataset.bind(this);
    this.toggleStylesPanel = this.toggleStylesPanel.bind(this);
    this.toggleSettingsPanel = this.toggleSettingsPanel.bind(this);
  }

  toggleMenuItem(ev) {
    ev.preventDefault();

    this._closeAllPanels();
    this.setState({
      activeTab: this.state.activeTab !== 'opdatasets' ? 'opdatasets' : null
    });
  }

  toggleDataset(dataset, ev) {
    ev.preventDefault();

    const changeState = Object.assign({}, _.omit(this.state, ['activeTab', 'activeView']));
    changeState[dataset] = !this.state[dataset];

    this.props.actions.configureChart({
      opdatasets: changeState
    });

    this.setState(changeState);
  }

  _closeAllPanels(panel) {
    if (panel !== 'styles') {
      document.getElementById('styles-panel').classList.remove('active');
    }

    if (panel !== 'settings') {
      document.getElementById('settings-panel').classList.remove('active');
    }
  }

  toggleStylesPanel(ev) {
    ev.preventDefault();

    this._closeAllPanels('styles');
    document.getElementById('styles-panel').classList.toggle('active');
    this.setState({
      activeTab: document.getElementById('styles-panel').classList.contains('active') ? 'styles' : null
    });
  }

  toggleSettingsPanel(ev) {
    ev.preventDefault();

    this._closeAllPanels('settings');
    document.getElementById('settings-panel').classList.toggle('active');
    this.setState({
      activeTab: document.getElementById('settings-panel').classList.contains('active') ? 'settings' : null
    });
  }

  // should this be a route or done via redux? route i think
  changeView(view, ev) {
    this.setState({
      activeView: view
    });
  }

  render() {
    return (
      <aside className="side-navigation-wrap sidebar-fixed">
        <div className="slimScrollDiv" style={{position: 'relative', overflow: 'hidden', width: 'auto', height: '100%'}}>
          <div className="sidenav-inner" style={{overflow: 'hidden', width: 'auto', height: '100%'}}>
            <ul className="side-nav magic-nav">
              <li className="side-nav-header">
                Views
                <small>
                  <a href="#" className="animated rubberBand">
                    <i className="fa fa-desktop fa-lg"></i>
                  </a>
                </small>
              </li>
              <li className={'view-item ' + (this.state.activeView === 'simulations' ? 'active' : '')}>
                <Link to="/simulations" onClick={(ev) => this.changeView('simulations', ev)}>
                  <i className="fa fa-circle fa-lg"></i> <span className="nav-text"><strong>Simulations</strong></span>
                </Link>
              </li>
              <li className={'view-item ' + (this.state.activeView === 'events' ? 'active' : '')}>
                <Link to="/events" onClick={(ev) => this.changeView('events', ev)}>
                  <i className="fa fa-circle-o fa-lg"></i> <span className="nav-text"><strong>Event Timeline</strong></span>
                </Link>
              </li>
              <li className={'view-item ' + (this.state.activeView === 'availability' ? 'active' : '')}>
                <Link to="/availability" onClick={(ev) => this.changeView('availability', ev)}>
                  <i className="fa fa-circle-o fa-lg"></i> <span className="nav-text"><strong>Sensor Availability</strong></span>
                </Link>
              </li>
              <li className="side-nav-header">
                Customize
                <small>
                  <a href="#" className="animated rubberBand">
                    <i className="fa fa-sliders fa-lg"></i>
                  </a>
                </small>
              </li>
              <li className={`has-submenu ${(this.state.activeTab === 'opdatasets' ? 'active open' : '')}`}>
                <a href="#" onClick={this.toggleMenuItem}>
                  <i className="fa fa-list"></i> <span className="nav-text">Opdatasets</span>
                </a>
                <div className={`sub-menu collapse secondary list-style-circle ${(this.state.activeTab === 'opdatasets' ? 'in' : '')}`}>
                  <ul>
                    <li className={this.state.rp ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('rp', ev)}>Reservoir Pressure</a>
                    </li>
                    <li className={this.state.bhp ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('bhp', ev)}>Bore Hole Pressure</a>
                    </li>
                    <li className={this.state.whp ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('whp', ev)}>Well Head Pressure</a>
                    </li>
                    <li className={this.state.bht ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('bht', ev)}>Bore Hole Temperature</a>
                    </li>
                    <li className={this.state.wht ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('wht', ev)}>Well Head Temperature</a>
                    </li>
                    <li className={this.state.q ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('q', ev)}>Flow Rate</a>
                    </li>
                  </ul>
                </div>
              </li>
              <li className={this.state.activeTab === 'styles' ? 'active' : ''}>
                <a href="#" onClick={this.toggleStylesPanel}>
                  <i className="fa fa-paint-brush"></i> <span className="nav-text">Styles</span>
                </a>
              </li>
              <li className={this.state.activeTab === 'settings' ? 'active' : ''}>
                <a href="#" onClick={this.toggleSettingsPanel}>
                  <i className="fa fa-cog"></i> <span className="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    );
  }
};

const mapStateToProps = (state) => ({
  chart: state.chart.configuration,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);