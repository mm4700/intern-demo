import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';

export default class EventsView extends Component {
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
    this.props.actions.fetchEvents(this.props.chart).then(() => {
      this.drawChart();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.previous) {
      if (nextProps.chart.filters.startDate !== this.state.previous.startDate
        || nextProps.chart.filters.endDate !== this.state.previous.endDate) {
        this.setState({
          dataRefreshRequired: true
        });
      }
      else {
        this.setState({
          dataRefreshRequired: false
        });
      }
    }
  }

  componentDidUpdate() {
    if (this.state.dataRefreshRequired) {
      this.fetchNextData(this.props.chart);
    }
    else {
      this.drawChart();
    }

    this.state.previous = Object.assign({}, this.props.chart.filters);
  }

  drawChart() {
    if (this.props.events === null) {
      return;
    }

    const margin = { top: 25, right: 55, bottom: 100, left: 75 };
    const el = document.getElementById('events-view');
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    const width = el.clientWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(el)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    const minDate = new Date(d3.min(this.props.events.map(d => { return d.dateHour; })));
    const maxDate = new Date(d3.max(this.props.events.map(d => { return d.dateHour; })));
    const x = d3.time.scale()
      .domain([
        minDate,
        maxDate
      ])
      .range([0, width]);
    
    const y = d3.scale.linear().range([height, 0])
      .domain([
        0,
        100
      ]);

    const xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');
      //.tickFormat(d3.time.format(timeFormat));

    const yAxis = d3.svg.axis()
      .scale(y)
      .ticks(0)
      .orient('left');

    svg
      .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
          .attr('transform', function(d) {
            return 'translate(' + this.getBBox().height*-1 + ',' + this.getBBox().height + ')rotate(-45)';
          });

    svg
      .append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // draw the actual events
    const dataRef = this.props.events;
    const myData = this.props.events.filter((d, i) => { return i !== 0; });
    console.log('myData', myData);
    myData.forEach((data) => {
      svg.append('rect')
        .datum(data)
        .attr('class', 'bar')
        .attr('x', (d) => { console.log('x', d); return x(new Date(d.dateHour)); })
        .attr('y', (d) => { return y(100); })
        .attr('width', (d, i) => { return x(new Date(dataRef[i + 1].dateHour)) - x(new Date(dataRef[i].dateHour)); })
        .attr('height', (d) => { return y(0); });
    });
  }

  render() {
    return (
      <div className="main-container">
        <div className="row">
          <div className="col-xs-12">
            <div id="events-view"></div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  events: state.events.events,
  chart: state.chart.configuration,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps, undefined, { pure: false })(EventsView);