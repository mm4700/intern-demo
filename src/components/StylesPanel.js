import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import { SketchPicker } from 'react-color';
import _ from 'lodash';

const dashArraySettings = [
  '5, 5',
  '5, 10',
  '10, 5',
  '5, 1',
  '1, 5',
  '0.9',
  '15, 10, 5',
  '15, 10, 5, 10',
  '15, 10, 5, 10, 15',
  '5, 5, 1, 5',
];

export class StylesPanel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      uncertainity: {
        strokeWidth: 1,
        strokeColor: {
          r: '226',
          g: '198',
          b: '218',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      showBounds: true,
      showBand: false,
      uncertainityBounds: {
        strokeWidth: 1,
        strokeColor: {
          r: '159',
          g: '164',
          b: '123',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      uncertainityBand: {
        strokeWidth: 1,
        strokeColor: {
          r: '70',
          g: '80',
          b: '133',
          a: '1',
        },
        dashArray: 'none',
        fill: {
          r: '0',
          g: '205',
          b: '161',
          a: '0.8',
        },
        interpolation: 'basis',
      },
      measurements: {
        strokeWidth: 1,
        strokeColor: {
          r: '186',
          g: '188',
          b: '148',
          a: '1',
        },
        fill: '#fff'
      },
      flowRate: {
        strokeWidth: 1,
        strokeColor: {
          r: '146',
          g: '205',
          b: '0',
          a: '1',
        },
        dashArray: 'none',
        interpolation: 'basis',
      },
      misc: {
        colorPicker: false,
        expanded: null
      }
    };

    this.toggleSection = this.toggleSection.bind(this);
  }

  handleColorChange(parent, setting, color) {
    const change = {};
    change[parent] = this.state[parent];
    change[parent][setting] = color.rgb;

    this.props.actions.configureChart({
      styles: _.omit(this.state, 'misc')
    });

    this.setState(change);
  }

  handleChange(parent, setting, event) {
    const change = {};
    change[parent] = this.state[parent];
    change[parent][setting] = _.isString(event) ? event : event.currentTarget.value;

    this.props.actions.configureChart({
      styles: _.omit(this.state, 'misc')
    });

    this.setState(change);
  }

  handleClick(setting) {
    const change = this.state.misc;
    change.colorPicker = !this.state.misc.colorPicker;
    this.setState({ misc: change });
  }

  handleClose(setting) {
    const change = this.state.misc;
    change.colorPicker = false;
    this.setState({ misc: change });
  }

  toggleSection(section, ev) {
    ev.preventDefault();

    const val = this.state.misc.expanded === section ? null : section;
    this.setState({
      misc: _.merge(this.state.misc, { expanded: val, colorPicker: false })
    });
  }

  render() {
    let index;
    let highlight;
    if (this.state.misc.expanded !== null) {
      index = dashArraySettings.indexOf(this.state[this.state.misc.expanded].dashArray);
      if (index === -1) {
        index = 0;
      } else {
        index++;
      }

      highlight = <rect x="0" y={'' + (20 * index)}  width="210" height="20" style={{fill: 'rgba(198, 203, 215, 0.29)'}}></rect>;
    }

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
                <a href="#" onClick={(ev) => this.toggleSection('uncertainity', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'uncertainity' ? 'fa-caret-down' : 'fa-caret-right')}></i> Estimated Well Head Pressure
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
                <div style={{marginTop: '15px', marginLeft: '12px', display: (this.state.misc.expanded === 'uncertainity') ? 'block' : 'none'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Width</label>
                      <input type="number" className="form-control" value={this.state.uncertainity.strokeWidth} onChange={(ev) => this.handleChange('uncertainity', 'strokeWidth', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a2">Stroke Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'uncertainity') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.uncertainity.strokeColor.r }, ${ this.state.uncertainity.strokeColor.g }, ${ this.state.uncertainity.strokeColor.b }, ${ this.state.uncertainity.strokeColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'uncertainity') } />
                          <SketchPicker color={ this.state.uncertainity.strokeColor } onChange={(color) => this.handleColorChange.call(this, 'uncertainity', 'strokeColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label htmlFor="a3">Dashed</label>
                      <svg width="200" height="200">
                        {highlight}
                        <line onClick={(ev) => this.handleChange('uncertainity', 'dashArray', 'none')} x1="10" y1="10" x2="190" y2="10" style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        {dashArraySettings.map((d, i) => {
                          return <line key={'dash-' + i} onClick={(ev) => this.handleChange('uncertainity', 'dashArray', d)} strokeDasharray={d} x1="10" y1={'' + (10 + (20 * (i+1)))} x2="190" y2={'' + (10 + (20 * (i+1)))} style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        })}
                      </svg>
                    </div>
                    <div className="form-group">
                      <label>Interpolation</label>
                      <select className="form-control" value={this.state.uncertainity.interpolation} onChange={(ev) => this.handleChange('uncertainity', 'interpolation', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}}>
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
                <a href="#" onClick={(ev) => this.toggleSection('uncertainityBounds', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'uncertainityBounds' ? 'fa-caret-down' : 'fa-caret-right')}></i> Estimated Well Head Pressure Uncertainity Bounds
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
              </div>
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('uncertainityBand', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'uncertainityBand' ? 'fa-caret-down' : 'fa-caret-right')}></i> Estimated Well Head Pressure Uncertainity Band
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
              </div>
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('pressure', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'pressure' ? 'fa-caret-down' : 'fa-caret-right')}></i> Pressure Readings
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
              </div>
              <div className="list-group-item styles">
                <a href="#" onClick={(ev) => this.toggleSection('flowRate', ev)} style={{color: '#9cabba', textDecoration: 'none'}}>
                  <i className={'fa ' + (this.state.misc.expanded === 'flowRate' ? 'fa-caret-down' : 'fa-caret-right')}></i> Flow Rate
                </a>
                <hr style={{margin: '5px 0', border: 0}}/>
                <div style={{marginTop: '15px', marginLeft: '12px', display: (this.state.misc.expanded === 'flowRate') ? 'block' : 'none'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Width</label>
                      <input type="number" className="form-control" value={this.state.flowRate.strokeWidth} onChange={(ev) => this.handleChange('flowRate', 'strokeWidth', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a2">Stroke Color</label>
                      <div className="styles swatch" style={{width: '46px', display: 'block'}} onClick={() => this.handleClick.call(this, 'flowRate') }>
                        <div className="styles color" style={{background: `rgba(${ this.state.flowRate.strokeColor.r }, ${ this.state.flowRate.strokeColor.g }, ${ this.state.flowRate.strokeColor.b }, ${ this.state.flowRate.strokeColor.a })`}}/>
                      </div>
                      { this.state.misc.colorPicker ?
                        <div className="styles popv">
                          <div className="styles cover" onClick={() => this.handleClose.call(this, 'flowRate') } />
                          <SketchPicker color={ this.state.flowRate.strokeColor } onChange={(color) => this.handleColorChange.call(this, 'flowRate', 'strokeColor', color) } />
                        </div>
                        : null }
                    </div>
                    <div className="form-group">
                      <label htmlFor="a3">Dashed</label>
                      <svg width="200" height="200">
                        {highlight}
                        <line onClick={(ev) => this.handleChange('flowRate', 'dashArray', 'none')} x1="10" y1="10" x2="190" y2="10" style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        {dashArraySettings.map((d, i) => {
                          return <line onClick={(ev) => this.handleChange('flowRate', 'dashArray', d)} strokeDasharray={d} x1="10" y1={'' + (10 + (20 * (i+1)))} x2="190" y2={'' + (10 + (20 * (i+1)))} style={{stroke: 'white', strokeWidth: 2, cursor: 'pointer'}}/>
                        })}
                      </svg>
                    </div>
                    <div className="form-group">
                      <label>Interpolation</label>
                      <select className="form-control" value={this.state.flowRate.interpolation} onChange={(ev) => this.handleChange('flowRate', 'interpolation', ev)} style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}}>
                        <option value="linear">Use piecewise linear segments</option>
                        <option value="step-before">Alternate between vertical and horizontal segments</option>
                        <option value="step-after">Alternate between horizontal and vertical segments</option>
                        <option value="basis">Use a B-spline</option>
                      </select>
                    </div>
                  </form>
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

export default connect(mapStateToProps, mapDispatchToProps)(StylesPanel);
