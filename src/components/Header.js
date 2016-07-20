import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import MaskedInput from 'react-maskedinput';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';

export class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      filters: false,
      startDate: '01/01/2016 00:00:00',
      endDate: '01/14/2016 23:59:59',
      wells: [true, true, true, true, true, true, true, true, true, true],
      aggregate: 'daily',
    };

    this.handleXsNav = this.handleXsNav.bind(this);
    this.toggleFilters = this.toggleFilters.bind(this);
    this.handleAggregateChange = this.handleAggregateChange.bind(this);
    this.handleWellSelection = this.handleWellSelection.bind(this);
    this.hangleStartDateChange = this.hangleStartDateChange.bind(this);
    this.hangleEndDateChange = this.hangleEndDateChange.bind(this);
  }

  handleXsNav(ev) {
    ev.preventDefault();

    document.getElementById('root').classList.toggle('side-nav-shown');
  }

  toggleFilters(ev) {
    ev.preventDefault();

    this.setState({
      filters: !this.state.filters
    });
  }

  handleAggregateChange(ev) {
    const change = _.omit(this.state, 'filters');
    change.aggregate = ev.currentTarget.id;
    this.props.actions.configureChart({
      filters: change
    });

    this.setState({
      aggregate: ev.currentTarget.id
    });
  }

  handleWellSelection(index) {
    const change = _.omit(this.state, 'filters');
    change.wells[index] = !change.wells[index];
    this.props.actions.configureChart({
      filters: change
    });

    this.setState({
      wells: wells
    });
  }

  hangleStartDateChange(ev) {
    ev.preventDefault();

    console.log('hangleStartDateChange', this.refs.startDate.value)

    const change = _.omit(this.state, 'filters');
    change.startDate = this.refs.startDate.value;
    this.props.actions.configureChart({
      filters: change
    });

    this.setState({
      startDate: this.refs.startDate.value
    });
  }

  hangleEndDateChange() {
    const change = _.omit(this.state, 'filters');
    change.endDate = this.refs.endDate.value;
    this.props.actions.configureChart({
      filters: change
    });

    this.setState({
      endDate: this.refs.endDate.value
    });
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
          <ul className="nav navbar-nav">
            <li className={'dropdown dropdown-full hidden-sm ' + (this.state.filters ? 'open' : '')}>
              <a href="#" data-toggle="dropdown" onClick={this.toggleFilters} style={{fontSize: '14px', cursor: 'pointer'}}>Filters <i className="fa fa-caret-down"></i></a>
              <div className={'dropdown-menu clickable-dropdown dropdown-animated fade-effect ' + (this.state.filters ? 'opened' : '')}>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="text-upper">Wells</div>
                    <div className="row m-t-10 font-12">
                      <div className="col-sm-6">
                        <ul className="list-unstyled line-2x link-unstyled-wrap">
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well1" id="well1" checked={this.state.wells[0]} onChange={() => this.handleWellSelection(0)} />
                                    <label htmlFor="well1">Standard Draw 9-20-18-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well2" id="well2" checked={this.state.wells[1]} onChange={() => this.handleWellSelection(1)} />
                                    <label htmlFor="well2">CG Road 14-2-19-94</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well3" id="well3" checked={this.state.wells[2]} onChange={() => this.handleWellSelection(2)} />
                                    <label htmlFor="well3">Wild Rose 16-30-17-94</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well4" id="well4" checked={this.state.wells[3]} onChange={() => this.handleWellSelection(3)} />
                                    <label htmlFor="well4">Creston Nose 1-9-18-92</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well5" id="well5" checked={this.state.wells[4]} onChange={() => this.handleWellSelection(4)} />
                                    <label htmlFor="well5">CG Road 14-1-19-94</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="col-sm-6">
                        <ul className="list-unstyled line-2x link-unstyled-wrap">
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well6" id="well6" checked={this.state.wells[5]} onChange={() => this.handleWellSelection(5)} />
                                    <label htmlFor="well6">Coal Gulch 7A-34-17-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well7" id="well7" checked={this.state.wells[6]} onChange={() => this.handleWellSelection(6)} />
                                    <label htmlFor="well7">Coal Gulch 9-28-17-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well8" id="well8" checked={this.state.wells[7]} onChange={() => this.handleWellSelection(7)} />
                                    <label htmlFor="well8">Flat Top Fed Gulch 13-23-14-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well9" id="well9" checked={this.state.wells[8]} onChange={() => this.handleWellSelection(8)} />
                                    <label htmlFor="well9">Tierney 16-12-19-94</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="checkbox" style={{margin: '2px 0'}}>
                                  <div className="custom-checkbox font-12 no-animation">
                                    <input type="checkbox" name="well10" id="well10" checked={this.state.wells[9]} onChange={() => this.handleWellSelection(9)} />
                                    <label htmlFor="well10">Robbers Gulch 12-30-14-92</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 b-all b-lr line-dashed m-t-15-xs">
                    <div className="text-upper">Date/Time Range</div>
                    <div className="row m-t-10 font-12">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <MaskedInput mask="11/11/1111 11:11:11" ref="startDate" value={this.state.startDate} onChange={this.hangleStartDateChange} className="form-control"/>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <MaskedInput mask="11/11/1111 11:11:11" ref="endDate" value={this.state.endDate} onChange={this.hangleEndDateChange} className="form-control"/>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="text-upper">Aggregate</div>
                        <div className="form-group" style={{marginTop: '15px'}}>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="hourly" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'hourly'} />
                              <label htmlFor="hourly">Hourly</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="daily" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'daily'} />
                              <label htmlFor="daily">Daily</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="weekly" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'weekly'} />
                              <label htmlFor="weekly">Weekly</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="monthly" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'monthly'} />
                              <label htmlFor="monthly">Monthly</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  chart: state.chart.configuration,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
