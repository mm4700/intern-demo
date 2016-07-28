import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import InputElement from 'react-input-mask';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';

const wellList = [
  'Standard Draw 9-20-18-93',
  'CG Road 14-2-19-94',
  'Wild Rose 16-30-17-94',
  'Creston Nose 1-9-18-92',
  'CG Road 14-1-19-94',
  'Coal Gulch 7A-34-17-93',
  'Coal Gulch 9-28-17-93',
  'Flat Top Fed Gulch 13-23-14-93',
  'Tierney 16-12-19-94',
  'Robbers Gulch 12-30-14-92'
];

export class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      filters: false,
      startDate: '01/01/2015 00:00',
      endDate: '12/31/2015 23:59',
      well: 'Standard Draw 9-20-18-93',
      grouping: 'daily',
      aggregate: 'avg',
    };

    this.handleXsNav = this.handleXsNav.bind(this);
    this.toggleFilters = this.toggleFilters.bind(this);
    this.handleGroupingChange = this.handleGroupingChange.bind(this);
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

  handleGroupingChange(ev) {
    const change = _.omit(this.state, 'filters');
    change.grouping = ev.currentTarget.id;
    this.props.actions.configureChart({
      filters: change
    });

    this.setState({
      grouping: ev.currentTarget.id
    });
  }

  handleWellSelection(well) {
    console.log('well', well);

    const change = _.omit(this.state, 'filters');
    change.well = well;
    this.props.actions.configureChart({
      filters: change
    });
    console.log('well', change);

    this.setState({
      well: well
    });
  }

  hangleStartDateChange(ev) {
    ev.preventDefault();

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
    const el = document.getElementsByClassName('side-navigation-wrap');
    let minified = '';
    if (el.length > 0) {
      minified = el[0].style.left;
    }

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
            <li className="dropdown">
              <a href="#" className="animsition-link" style={{fontSize: '14px'}}>
                <span className="label label-default">Well: <strong>{this.props.chart.filters.well}</strong></span>
                <span className="label label-default" style={{marginLeft: '15px'}}>Date Range: <strong>{this.props.chart.filters.startDate.toString()} - {this.props.chart.filters.endDate.toString()}</strong></span>
                <span className="label label-default" style={{marginLeft: '15px'}}>Grouping: <strong>{this.props.chart.filters.grouping}</strong></span>
                <span className="label label-default" style={{marginLeft: '15px'}}>Aggregation: <strong>{this.props.chart.filters.aggregate}</strong></span>
              </a>
            </li>
            <li className={'dropdown dropdown-full hidden-sm ' + (this.state.filters ? 'open' : '')}>
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
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Standard Draw 9-20-18-93" value="Standard Draw 9-20-18-93" checked={this.state.well === 'Standard Draw 9-20-18-93'} onChange={() => this.handleWellSelection('Standard Draw 9-20-18-93')} />
                                    <label htmlFor="Standard Draw 9-20-18-93">Standard Draw 9-20-18-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="CG Road 14-2-19-94" value="CG Road 14-2-19-94" checked={this.state.well === 'CG Road 14-2-19-94'} onChange={() => this.handleWellSelection('CG Road 14-2-19-94')} />
                                    <label htmlFor="CG Road 14-2-19-94">CG Road 14-2-19-94</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Wild Rose 16-30-17-94" value="Wild Rose 16-30-17-94" checked={this.state.well === 'Wild Rose 16-30-17-94'} onChange={() => this.handleWellSelection('Wild Rose 16-30-17-94')} />
                                    <label htmlFor="Wild Rose 16-30-17-94">Wild Rose 16-30-17-94</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Creston Nose 1-9-18-92" value="Creston Nose 1-9-18-92" checked={this.state.well === 'Creston Nose 1-9-18-92'} onChange={() => this.handleWellSelection('Creston Nose 1-9-18-92')} />
                                    <label htmlFor="Creston Nose 1-9-18-92">Creston Nose 1-9-18-92</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="CG Road 14-1-19-94" value="CG Road 14-1-19-94" checked={this.state.well === 'CG Road 14-1-19-94'} onChange={() => this.handleWellSelection('CG Road 14-1-19-94')} />
                                    <label htmlFor="CG Road 14-1-19-94">CG Road 14-1-19-94</label>
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
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Coal Gulch 7A-34-17-93" value="Coal Gulch 7A-34-17-93" checked={this.state.well === 'Coal Gulch 7A-34-17-93'} onChange={() => this.handleWellSelection('Coal Gulch 7A-34-17-93')} />
                                    <label htmlFor="Coal Gulch 7A-34-17-93">Coal Gulch 7A-34-17-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Coal Gulch 9-28-17-93" value="Coal Gulch 9-28-17-93" checked={this.state.well === 'Coal Gulch 9-28-17-93'} onChange={() => this.handleWellSelection('Coal Gulch 9-28-17-93')} />
                                    <label htmlFor="Coal Gulch 9-28-17-93">Coal Gulch 9-28-17-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Flat Top Fed Gulch 13-23-14-93" value="Flat Top Fed Gulch 13-23-14-93" checked={this.state.well === 'Flat Top Fed Gulch 13-23-14-93'} onChange={() => this.handleWellSelection('Flat Top Fed Gulch 13-23-14-93')} />
                                    <label htmlFor="Flat Top Fed Gulch 13-23-14-93">Flat Top Fed Gulch 13-23-14-93</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Tierney 16-12-19-94" value="Tierney 16-12-19-94" checked={this.state.well === 'Tierney 16-12-19-94'} onChange={() => this.handleWellSelection('Tierney 16-12-19-94')} />
                                    <label htmlFor="Tierney 16-12-19-94">Tierney 16-12-19-94</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li>
                            <div className="form-group" style={{marginBottom: 0}}>
                              <div className="col-xs-12" style={{padding: 0}}>
                                <div className="radio" style={{margin: '2px 0'}}>
                                  <div className="custom-radio font-12 no-animation">
                                    <input type="radio" name="well" id="Robbers Gulch 12-30-14-92" value="Robbers Gulch 12-30-14-92" checked={this.state.well === 'Robbers Gulch 12-30-14-92'} onChange={() => this.handleWellSelection('Robbers Gulch 12-30-14-92')} />
                                    <label htmlFor="Robbers Gulch 12-30-14-92">Robbers Gulch 12-30-14-92</label>
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
                          <InputElement mask="99/99/9999 99:99" ref="startDate" defaultValue={this.state.startDate} onBlur={this.hangleStartDateChange} className="form-control" placeholder="Start Date/Time"/>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <InputElement mask="99/99/9999 99:99" ref="endDate" defaultValue={this.state.endDate} onBlur={this.hangleEndDateChange} className="form-control" placeholder="End Date/Time"/>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="text-upper">Grouping</div>
                        <div className="form-group" style={{marginTop: '15px'}}>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="hourly" type="radio" name="grouping" onChange={this.handleGroupingChange} checked={this.state.grouping === 'hourly'} />
                              <label htmlFor="hourly">Hourly</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="daily" type="radio" name="grouping" onChange={this.handleGroupingChange} checked={this.state.grouping === 'daily'} />
                              <label htmlFor="daily">Daily</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="weekly" type="radio" name="grouping" onChange={this.handleGroupingChange} checked={this.state.grouping === 'weekly'} />
                              <label htmlFor="weekly">Weekly</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="monthly" type="radio" name="grouping" onChange={this.handleGroupingChange} checked={this.state.grouping === 'monthly'} />
                              <label htmlFor="monthly">Monthly</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="text-upper">Aggregate</div>
                        <div className="form-group" style={{marginTop: '15px'}}>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="min" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'min'} />
                              <label htmlFor="min">Min</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="max" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'max'} />
                              <label htmlFor="max">Max</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="sum" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'sum'} />
                              <label htmlFor="sum">Sum</label>
                            </div>
                          </div>
                          <div className="radio-inline">
                            <div className="custom-radio font-12">
                              <input id="avg" type="radio" name="aggregate" onChange={this.handleAggregateChange} checked={this.state.aggregate === 'avg'} />
                              <label htmlFor="avg">Avg</label>
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
          <ul className="nav navbar-nav navbar-right">
            <li className="hidden-xs">
              <Link to="about">
                <i className="fa fa-lg fa-question-circle-o m-d-1"></i>
              </Link>
            </li>
          </ul>
        </div>
        <div onClick={this.toggleFilters} className="pull-down" style={{cursor: 'pointer', color: '#464c52', borderRadius: '0 0 4px 4px', background: 'white', position: 'fixed', top: this.state.filters ? '294px' : '50px', boxShadow: this.state.filters ? '1px 1px 5px #ccc' : 'none', left: (minified.charAt(0) === '-') ? ((document.body.clientWidth / 2) - 50) + 'px' : ((((document.body.clientWidth - 230) / 2) - 50) + 230) + 'px', width: '100px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.5)', borderLeft: '1px solid rgba(0,0,0,.5)', borderRight: '1px solid rgba(0,0,0,0.5)'}}>
          <i className={'fa pull-right ' + (this.state.filters ? 'fa-caret-up' : 'fa-caret-down')} style={{marginRight: '5px', marginTop: '3px'}}></i> <i className={'fa pull-left ' + (this.state.filters ? 'fa-caret-up' : 'fa-caret-down')} style={{marginLeft: '5px', marginTop: '3px'}}></i> Filters
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
