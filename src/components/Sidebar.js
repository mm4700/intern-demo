import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export class Sidebar extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      activeTab: null,
      uncertainity: true,
      measurements: true,
      rates: true,
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

    const changeState = {};
    changeState[dataset] = !this.state[dataset];

    this.props.actions.configureChart({
      opdatasets: {
        uncertainity: this.state['uncertainity'],
        measurements: this.state['measurements'],
        rates: this.state['rates'],
      }
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

  render() {
    return (
      <aside className="side-navigation-wrap sidebar-fixed">
        <div className="slimScrollDiv" style={{position: 'relative', overflow: 'hidden', width: 'auto', height: '100%'}}>
          <div className="sidenav-inner" style={{overflow: 'hidden', width: 'auto', height: '100%'}}>
            <ul className="side-nav magic-nav">
              <li className="side-nav-header">
                Controls
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
                    <li className={this.state.uncertainity ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('uncertainity', ev)}>Uncertainity</a>
                    </li>
                    <li className={this.state.measurements ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('measurements', ev)}>Measurements</a>
                    </li>
                    <li className={this.state.rates ? 'active' : ''}>
                      <a href="#" className="animsition-link" onClick={(ev) => this.toggleDataset('rates', ev)}>Flow Rate</a>
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

export default Sidebar;