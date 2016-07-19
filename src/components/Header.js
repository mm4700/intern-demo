import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import InputElement from 'react-input-mask';

export class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      filters: false,
      startDate: '01/01/2016 00:00:00',
      endDate: '01/14/2016 23:59:59',
    };

    this.handleXsNav = this.handleXsNav.bind(this);
    this.toggleFilters = this.toggleFilters.bind(this);
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
                                    <input type="checkbox" name="well1" id="well1" />
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
                                    <input type="checkbox" name="well2" id="well2" />
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
                                    <input type="checkbox" name="well3" id="well3" />
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
                                    <input type="checkbox" name="well4" id="well4" />
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
                                    <input type="checkbox" name="well5" id="well5" />
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
                                    <input type="checkbox" name="well6" id="well6" />
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
                                    <input type="checkbox" name="well7" id="well7" />
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
                                    <input type="checkbox" name="well8" id="well8" />
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
                                    <input type="checkbox" name="well9" id="well9" />
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
                                    <input type="checkbox" name="well10" id="well10" />
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
                          <InputElement mask="99/99/9999 99:99:99" value={this.state.startDate} className="form-control" placeholder="Start Date/Time"/>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <InputElement mask="99/99/9999 99:99:99" value={this.state.endDate} className="form-control" placeholder="End Date/Time"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 b-all b-lr line-dashed">
                    <div className="text-center m-t-20"><button className="btn btn-main" type="button">Filter</button></div>
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

export default Header;
