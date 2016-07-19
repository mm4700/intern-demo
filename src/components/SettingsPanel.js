import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';

export class SettingsPanel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      showLegend: false,
      showUncertainityBounds: true,
      showUncertainityBand: false,
      showEdgeCoordinates: true,
      enableTooltips: true,
      enableDataPointInteraction: false,
    };

    this.handleSettingChange = this.handleSettingChange.bind(this);
  }

  handleSettingChange(ev) {
    const change = {};
    change[ev.currentTarget.name] = ev.currentTarget.checked;

    this.props.actions.configureChart({
      settings: this.state
    });

    this.setState(change);
  }

  render() {
    return (
      <aside className="right-sidebar-wrap sidebar-fixed secondary-panel" id="settings-panel">
        <ul className="sidebar-tab list-unstyled clearfix font-header font-11 bg-main">
          <li className="active" style={{width: '100%'}}>
            <a href="#" className="text-muted">Custom Settings</a>
          </li>
        </ul>
        <div className="slimScrollDiv" style={{position: 'relative', overflow: 'hidden', width: 'auto', height: '100%'}}>
          <div className="sidenav-inner" style={{overflow: 'hidden', width: 'auto', height: '100%'}}>
            <div className="form-group">
              <div className="col-xs-12">
                <div className="checkbox">
                  <div className="custom-checkbox font-12 no-animation">
                    <input type="checkbox" name="showLegend" id="showLegend" checked={this.state.showLegend} onChange={this.handleSettingChange} />
                    <label htmlFor="showLegend">Show Legend</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
                <div className="checkbox">
                  <div className="custom-checkbox font-12 no-animation">
                    <input type="checkbox" name="showUncertainityBounds" id="showUncertainityBounds" checked={this.state.showLegend} onChange={this.handleSettingChange} />
                    <label htmlFor="showUncertainityBounds">Show Uncertainity Bounds</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
                <div className="checkbox">
                  <div className="custom-checkbox font-12 no-animation">
                    <input type="checkbox" name="showUncertainityBand" id="showUncertainityBand" checked={this.state.showUncertainityBand} onChange={this.handleSettingChange} />
                    <label htmlFor="showUncertainityBand">Show Uncertainity Band</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
                <div className="checkbox">
                  <div className="custom-checkbox font-12 no-animation">
                    <input type="checkbox" name="showEdgeCoordinates" id="showEdgeCoordinates" checked={this.state.showEdgeCoordinates} onChange={this.handleSettingChange} />
                    <label htmlFor="showEdgeCoordinates">Enable Edge Coordinates</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
                <div className="checkbox">
                  <div className="custom-checkbox font-12 no-animation">
                    <input type="checkbox" name="enableTooltips" id="enableTooltips" checked={this.state.enableTooltips} onChange={this.handleSettingChange} />
                    <label htmlFor="enableTooltips">Enable Tooltips</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-12">
                <div className="checkbox">
                  <div className="custom-checkbox font-12 no-animation">
                    <input type="checkbox" name="enableDataPointInteraction" id="enableDataPointInteraction" checked={this.state.enableDataPointInteraction} onChange={this.handleSettingChange} />
                    <label htmlFor="enableDataPointInteraction">Enable Data Interaction</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="slimScrollBar" style={{width: '2px', position: 'absolute', top: '0px', opacity: 0.4, display: 'none', borderRadius: '7px', zIndex: 99, right: '1px', height: '899px', background: 'rgb(149, 164, 184)'}}></div>
          <div className="slimScrollRail" style={{width: '2px', height: '100%', position: 'absolute', top: '0px', display: 'none', borderRadius: '7px', opacity: 0.2, zIndex: 90, right: '1px', background: 'rgb(51, 51, 51)'}}></div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);