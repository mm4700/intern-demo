import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import { SketchPicker } from 'react-color';
import _ from 'lodash';

export class StylesPanel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      uncertainity: {
        strokeWidth: 1,
        strokeColor: {
          r: '241',
          g: '112',
          b: '19',
          a: '1',
        },
        dashArray: null,
        interpolation: 'basis',
      },
      showBounds: true,
      showBand: false,
      uncertainityBounds: {
        strokeWidth: 1,
        strokeColor: '#fff',
        dashArray: null,
        interpolation: 'basis',
      },
      uncertainityBand: {
        strokeWidth: 1,
        strokeColor: '#fff',
        dashArray: null,
        fill: '',
        interpolation: 'basis',
      },
      measurements: {
        strokeWidth: 1,
        strokeColor: '#fff',
        fill: '#fff'
      },
      flowRate: {
        strokeWidth: 1,
        strokeColor: '#fff',
        dashArray: null,
        interpolation: 'basis',
      },
      misc: {
        uncertainityColorPicker: false,
      }
    };
  }

  handleColorChange(parent, setting, color) {
    const change = {};
    change[parent] = this.state[parent];
    change[parent][setting] = color.rgb;

    this.props.actions.configureChart({
      styles: _.omit(this.state, 'misc')
    });

    console.log('change', parent, setting, color, change);
    this.setState(change);
  }

  handleClick(setting) {
    const change = this.state.misc;
    change[setting + 'ColorPicker'] = !this.state.misc[setting + 'ColorPicker'];
    this.setState({ misc: change });
  }

  handleClose(setting) {
    const change = this.state.misc;
    change[setting + 'ColorPicker'] = false;
    this.setState({ misc: change });
  }

  render() {
    console.log('in render', this.state);

    return (
      <aside className="right-sidebar-wrap sidebar-fixed secondary-panel" id="styles-panel">
        <ul className="sidebar-tab list-unstyled clearfix font-header font-11 bg-main">
          <li className="active" style={{width: '100%'}}>
            <a href="#" className="text-muted">Custom Styles</a>
          </li>
        </ul>
        <div className="slimScrollDiv" style={{position: 'relative', overflow: 'hidden', width: 'auto', height: '100%'}}>
          <div className="sidenav-inner" style={{overflow: 'hidden', width: 'auto', height: '100%'}}>
            <div className="list-group font-12">
              <div className="list-group-item styles">
                <i className="fa fa-caret-down"></i> Measured Well Head Pressure
                <hr style={{margin: '5px 0'}}/>
                <div style={{marginTop: '15px', marginLeft: '12px'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Width</label>
                      <input type="email" className="form-control" id="a1" style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a2">Stroke Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'uncertainity') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.uncertainity.strokeColor.r }, ${ this.state.uncertainity.strokeColor.g }, ${ this.state.uncertainity.strokeColor.b }, ${ this.state.uncertainity.strokeColor.a })`}}/>
                      </div>
                      { this.state.misc.uncertainityColorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'uncertainity') } />
                          <SketchPicker color={ this.state.uncertainity.strokeColor } onChange={(color) => this.handleColorChange.call(this, 'uncertainity', 'strokeColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label htmlFor="a3">Dashed</label>
                      <svg width="200" height="200" viewPort="0 0 200 300" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <line strokeDasharray="5, 5"              x1="10" y1="10" x2="190" y2="10" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="5, 10"             x1="10" y1="30" x2="190" y2="30" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="10, 5"             x1="10" y1="50" x2="190" y2="50" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="5, 1"              x1="10" y1="70" x2="190" y2="70" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="1, 5"              x1="10" y1="90" x2="190" y2="90" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="0.9"               x1="10" y1="110" x2="190" y2="110" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="15, 10, 5"         x1="10" y1="130" x2="190" y2="130" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="15, 10, 5, 10"     x1="10" y1="150" x2="190" y2="150" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="15, 10, 5, 10, 15" x1="10" y1="170" x2="190" y2="170" style={{stroke: 'white', strokeWidth: 2}}/>
                        <line strokeDasharray="5, 5, 1, 5"        x1="10" y1="190" x2="190" y2="190" style={{stroke: 'white', strokeWidth: 2}}/>
                      </svg>
                    </div>
                    <div className="form-group">
                      <label htmlFor="a4">Interpolation</label>
                      <select className="form-control" style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}}>
                        <option value="linear">Use piecewise linear segments</option>
                        <option value="step-before">Alternate between vertical and horizontal segments</option>
                        <option value="step-after">Alternate between horizontal and vertical segments</option>
                        <option value="basis">Use a B-spline</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
              <div className="list-group-item styles">
                Estimated Well Head Pressure
                <hr style={{margin: '5px 0'}}/>
              </div>
              <div className="list-group-item styles">
                Estimated Well Head Pressure Upper Bound
                <hr style={{margin: '5px 0'}}/>
              </div>
              <div className="list-group-item styles">
                Estimated Well Head Pressure Lower Bound
                <hr style={{margin: '5px 0'}}/>
              </div>
              <div className="list-group-item styles">
                Flow Rate
                <hr style={{margin: '5px 0'}}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(StylesPanel);
