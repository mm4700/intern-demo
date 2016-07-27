import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';

export class AvailabilityView extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      dataRefreshRequired: false
    };
  }

  componentWillMount() {
    this.fetchNextData();
  }

  fetchNextData() {
    this.props.actions.fetchMeasurements(this.props.chart.filters).then(() => {
      this.drawChart();
    });
  }

  drawChart() {
    console.log('drawChart', this.measurements);
    const el = document.getElementById('eventsTab');
    document.getElementById('eventsTabSpinner').style.display = 'none';

    const width = el.clientWidth;
    
  }

  render() {
    return (
      <div className="main-container">
        <div className="row">
          <div className="col-xs-12" style={{padding: '25px'}}>
            <ul className="nav nav-tabs font-12" style={{borderBottomColor: '#95a4b8'}}>
              <li className="active">
                <a href="#a" style={{color: '#7f888f', borderColor: '#607786'}}>Recieve Events</a>
              </li>
              <li>
                <a href="#b" style={{color: '#f6f9fa', backgroundColor: '#95a4b8', borderColor: '#607786'}}>Data Availability</a>
              </li>
              <li>
                <a href="#v" style={{color: '#f6f9fa', backgroundColor: '#95a4b8', borderColor: '#607786'}}>Heatmap</a>
              </li>
            </ul>
            <div className="tab-content b-all no-b-t p-20 font-12" style={{border: '1px solid #95a4b8'}}>
              <div className="tab-pane fade in active" id="eventsTab">
                <div id="eventsTabSpinner" style={{width: '100%', textAlign: 'center'}}>
                  <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i> Processing millions of sensor readings....
                </div>
                <div id="events-chart"></div>
              </div>
              <div className="tab-pane fade" id="profileHomeEx1">This is profile tab</div>
              <div className="tab-pane fade" id="messageHomeEx1">This is message tab</div>
            </div>
          </div>
        </div>
      </div>);
  }
}

const mapStateToProps = (state) => ({
  measurements: state.measurements.data,
  chart: state.chart.configuration,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps, undefined, { pure: false })(AvailabilityView);
