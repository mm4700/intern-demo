import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { SketchPicker } from 'react-color';

export class StylesPanel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      uncertainity: {
        strokeWidth: 1,
        strokeColor: '#fff',
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
    };

    this.handleColorChange = this.handleColorChange.bind(this);
  }

  handleColorChange(setting, color) {
    //this.setState({ background: color.hex }); // rgb
  
    const change = {};
    change[setting] = color.rgb;

    this.props.actions.configureChart({
      colors: this.state
    });

    this.setState(change);
  }

  render() {
    return (
      <aside className="right-sidebar-wrap sidebar-fixed secondary-panel" id="styles-panel">
        <ul className="sidebar-tab list-unstyled clearfix font-header font-11 bg-main">
          <li className="active" style={{width: '100%'}}>
            <a href="#" className="text-muted">Custom Colors</a>
          </li>
        </ul>
        <div className="slimScrollDiv" style={{position: 'relative', overflow: 'hidden', width: 'auto', height: '100%'}}>
          <div className="sidenav-inner" style={{overflow: 'hidden', width: 'auto', height: '100%'}}>
            <div className="list-group font-12">
              <a href="#" className="list-group-item">
                Measured Well Head Pressure
                <hr/>
                <div style={{marginTop: '15px', marginLeft: '12px'}}>
                  <form className="font-12">
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Width</label>
                      <input type="email" className="form-control" id="a1" style={{borderRadius: 0, height: '22px', lineHeight: '22px', fontSize: '12px', padding: '2px 5px'}} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a1">Stroke Color</label>
                      <div is="swatch" onClick={ this.handleClick }>
                      <div is="color" /></div>
                      { this.state.displayColorPicker ? <div is="popover">
                        <div is="cover" onClick={ this.handleClose }/>
                        <SketchPicker color={ this.state.color } onChange={ this.handleChange } />
                      </div> : null }
                    </div>
                  </form>
                  <SketchPicker color={ this.state.uncertainityColor }  onChangeComplete={(color) => this.handleColorChange('uncertainityColor', color)} />
                </div>
              </a>
              <a href="#" className="list-group-item">
                <span className="m-r-5" style={{width: '16px', height: '16px', background: 'rgba(255,255,255,1)', display: 'inline-block'}}></span> Estimated Well Head Pressure
              </a>
              <a href="#" className="list-group-item">
                <span className="m-r-5 m-d-1" style={{width: '16px', height: '16px', background: 'rgba(255,255,255,1)', display: 'inline-block'}}></span> Estimated Well Head Pressure Upper Bound
              </a>
              <a href="#" className="list-group-item">
                <span className="m-r-5 m-d-2" style={{width: '16px', height: '16px', background: 'rgba(255,255,255,1)', display: 'inline-block'}}></span> Estimated Well Head Pressure Lower Bound
              </a>
              <a href="#" className="list-group-item">
                <span className="m-r-5 m-d-2" style={{width: '16px', height: '16px', background: 'rgba(255,255,255,1)', display: 'inline-block'}}></span> Flow Rate
              </a>
            </div>
          </div>
          <div className="slimScrollBar" style={{width: '2px', position: 'absolute', top: '0px', opacity: 0.4, display: 'none', borderRadius: '7px', zIndex: 99, right: '1px', height: '899px', background: 'rgb(149, 164, 184)'}}></div>
          <div className="slimScrollRail" style={{width: '2px', height: '100%', position: 'absolute', top: '0px', display: 'none', borderRadius: '7px', opacity: 0.2, zIndex: 90, right: '1px', background: 'rgb(51, 51, 51)'}}></div>
        </div>
      </aside>
    );
  }
};

export default StylesPanel;