import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';
import agent from 'superagent';

function visavailChart() {
  // define chart layout
  var margin = {
    // top margin includes title and legend
    top: 70,

    // right margin should provide space for last horz. axis title
    right: 40,

    bottom: 20,

    // left margin should provide space for y axis titles
    left: 200,
  };

  // height of horizontal data bars
  var dataHeight = 18;

  // spacing between horizontal data bars
  var lineSpacing = 14;

  // vertical space for heading
  var paddingTopHeading = -50;

  // vertical overhang of vertical grid lines on bottom
  var paddingBottom = 10;

  // space for y axis titles
  var paddingLeft = -200;

  var width = 940 - margin.left - margin.right;

  // title of chart is drawn or not (default: yes)
  var drawTitle = 1;

  // year ticks to be emphasized or not (default: yes)
  var emphasizeYearTicks = 1;

  // define chart pagination
  // max. no. of datasets that is displayed, 0: all (default: all)
  var maxDisplayDatasets = 0;

  // dataset that is displayed first in the current
  // display, chart will show datasets "curDisplayFirstDataset" to
  // "curDisplayFirstDataset+maxDisplayDatasets"
  var curDisplayFirstDataset = 0;

  // global div for tooltip
  var div = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  function chart(selection) {
    selection.each(function drawGraph(dataset) {
      // check which subset of datasets have to be displayed
      var maxPages = 0;
      var startSet;
      var endSet;
      if (maxDisplayDatasets !== 0) {
        startSet = curDisplayFirstDataset;
        if (curDisplayFirstDataset + maxDisplayDatasets > dataset.length) {
          endSet = dataset.length;
        } else {
          endSet = curDisplayFirstDataset + maxDisplayDatasets;
        }
        maxPages = Math.ceil(dataset.length / maxDisplayDatasets);
      } else {
        startSet = 0;
        endSet = dataset.length;
      }

      // append data attribute in HTML for pagination interface
      selection.attr('data-max-pages', maxPages);

      var noOfDatasets = endSet - startSet;
      var height = dataHeight * noOfDatasets + lineSpacing * noOfDatasets - 1;

      // parse data text strings to JavaScript date stamps
      dataset.forEach(function (d) {
        d.data.forEach(function (d1) {
          if (!(d1[0] instanceof Date)) {
            d1[0] = new Date(d1[0]);
            d1[2] = new Date(moment(d1[0]).add(1, 'minutes').valueOf());
          }
        });
      });

      // cluster data by dates to form time blocks
      dataset.forEach(function (series, seriesI) {
        var tmpData = [];
        var dataLength = series.data.length;
        series.data.forEach(function (d, i) {
          if (i !== 0 && i < dataLength) {
            if (d[1] === tmpData[tmpData.length - 1][1]) {
              // the value has not changed since the last date
              tmpData[tmpData.length - 1][2] = d[2];
              tmpData[tmpData.length - 1][3] = 1;
            } else {
              // the value has changed since the last date
              tmpData[tmpData.length - 1][2] = d[0]; // extend last block until new block starts
              d[3] = 0;
              tmpData.push(d);
            }
          } else if (i === 0) {
            d[3] = 0;
            tmpData.push(d);
          }
        });
        dataset[seriesI].disp_data = tmpData;
      });

      // determine start and end dates among all nested datasets
      var startDate = 0;
      var endDate = 0;

      debugger;
      dataset.forEach(function (series, seriesI) {
        if (seriesI === 0) {
          startDate = series.disp_data[0][0];
          endDate = series.disp_data[series.disp_data.length - 1][2];
        } else {
          if (series.disp_data[0][0] < startDate) {
            startDate = series.data[0][0];
          }
          if (series.disp_data[series.disp_data.length - 1][2] > endDate) {
            endDate = series.disp_data[series.disp_data.length - 1][2];
          }
        }
      });

      // define scales
      var xScale = d3.time.scale()
          .domain([startDate, endDate])
          .range([0, width])
          .clamp(1);

      // define axes
      var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient('top');

      // create SVG element
      var svg = d3.select(this).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // create basic element groups
      svg.append('g').attr('id', 'g_title');
      svg.append('g').attr('id', 'g_axis');
      svg.append('g').attr('id', 'g_data');

      // create y axis labels
      svg.select('#g_axis').selectAll('text')
          .data(dataset.slice(startSet, endSet))
          .enter()
          .append('text')
          .attr('x', paddingLeft)
          .attr('y', lineSpacing + dataHeight / 2)
          .text(function (d) {
            return d.measure;
          })
          .attr('transform', function (d, i) {
            return 'translate(0,' + ((lineSpacing + dataHeight) * i) + ')';
          })
          .attr('class', 'ytitle');

      // create vertical grid
      svg.select('#g_axis').selectAll('line.vert_grid').data(xScale.ticks())
          .enter()
          .append('line')
          .attr({
            'class': 'vert_grid',
            'x1': function (d) {
              return xScale(d);
            },
            'x2': function (d) {
              return xScale(d);
            },
            'y1': 0,
            'y2': dataHeight * noOfDatasets + lineSpacing * noOfDatasets - 1 + paddingBottom
          });

      // create horizontal grid
      svg.select('#g_axis').selectAll('line.horz_grid').data(dataset)
          .enter()
          .append('line')
          .attr({
            'class': 'horz_grid',
            'x1': 0,
            'x2': width,
            'y1': function (d, i) {
              return ((lineSpacing + dataHeight) * i) + lineSpacing + dataHeight / 2;
            },
            'y2': function (d, i) {
              return ((lineSpacing + dataHeight) * i) + lineSpacing + dataHeight / 2;
            }
          });

      // create x axis
      svg.select('#g_axis').append('g')
          .attr('class', 'axis')
          .call(xAxis);

      // make y groups for different data series
      var g = svg.select('#g_data').selectAll('.g_data')
          .data(dataset.slice(startSet, endSet))
          .enter()
          .append('g')
          .attr('transform', function (d, i) {
            return 'translate(0,' + ((lineSpacing + dataHeight) * i) + ')';
          })
          .attr('class', 'dataset');

      // add data series
      g.selectAll('rect')
          .data(function (d) {
            return d.disp_data;
          })
          .enter()
          .append('rect')
          .attr('x', function (d) {
            return xScale(d[0]);
          })
          .attr('y', lineSpacing)
          .attr('width', function (d) {
            return (xScale(d[2]) - xScale(d[0]));
          })
          .attr('height', dataHeight)
          .attr('class', function (d) {
            if (d[1] === 1) {
              return 'rect_has_data';
            }
            return 'rect_has_no_data';
          })
          .on('mouseover', function (d, i) {
            var matrix = this.getScreenCTM().translate(+this.getAttribute('x'), +this.getAttribute('y'));
            div.transition()
                .duration(200)
                .style('opacity', 0.9);
            div.html(function () {
              var output = '';
              if (d[1] === 1) {
                output = '<i class="fa fa-fw fa-check tooltip_has_data"></i>';
              } else {
                output = '<i class="fa fa-fw fa-times tooltip_has_no_data"></i>';
              }
              if (d[2] > d3.time.second.offset(d[0], 86400)) {
                return output + moment(d[0]).format('lll')
                    + ' - ' + moment(d[2]).format('lll');
              }
              return output + moment(d[0]).format('lll');
            })
            .style('left', function () {
              return window.pageXOffset + matrix.e + 'px';
            })
            .style('top', function () {
              return window.pageYOffset + matrix.f - 11 + 'px';
            })
            .style('height', dataHeight + 11 + 'px');
          })
          .on('mouseout', function () {
            div.transition()
                .duration(500)
                .style('opacity', 0);
          });

      // rework ticks and grid for better visual structure
      function isYear(t) {
        return +t === +(new Date(t.getFullYear(), 0, 1, 0, 0, 0));
      }

      function isMonth(t) {
        return +t === +(new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0));
      }

      var xTicks = xScale.ticks();
      var isYearTick = xTicks.map(isYear);
      var isMonthTick = xTicks.map(isMonth);
      // year emphasis
      // ensure year emphasis is only active if years are the biggest clustering unit
      if (emphasizeYearTicks
          && !(isYearTick.every(function (d) { return d === true; }))
          && isMonthTick.every(function (d) { return d === true; })) {
        d3.selectAll('g.tick').each(function (d, i) {
          if (isYearTick[i]) {
            d3.select(this)
                .attr({
                  'class': 'x_tick_emph',
                });
          }
        });
        d3.selectAll('.vert_grid').each(function (d, i) {
          if (isYearTick[i]) {
            d3.select(this)
                .attr({
                  'class': 'vert_grid_emph',
                });
          }
        });
      }

      // create title
      if (drawTitle) {
        svg.select('#g_title')
            .append('text')
            .attr('x', paddingLeft)
            .attr('y', paddingTopHeading)
            .text('Sensor Availability Plot')
            .attr('class', 'heading');
      }

      // create subtitle
      svg.select('#g_title')
          .append('text')
          .attr('x', paddingLeft)
          .attr('y', paddingTopHeading + 17)
          .text('from ' + moment(startDate).format('dddd, MMMM Do YYYY, hh:mm') + ' to '
              + moment(endDate).format('dddd, MMMM Do YYYY, hh:mm'))
          .attr('class', 'subheading');

      // create legend
      var legend = svg.select('#g_title')
          .append('g')
          .attr('id', 'g_legend')
          .attr('transform', 'translate(0,-12)');

      legend.append('rect')
          .attr('x', width + margin.right - 150)
          .attr('y', paddingTopHeading)
          .attr('height', 15)
          .attr('width', 15)
          .attr('class', 'rect_has_data');

      legend.append('text')
          .attr('x', width + margin.right - 150 + 20)
          .attr('y', paddingTopHeading + 8.5)
          .text('Data available')
          .attr('class', 'legend');

      legend.append('rect')
          .attr('x', width + margin.right - 150)
          .attr('y', paddingTopHeading + 17)
          .attr('height', 15)
          .attr('width', 15)
          .attr('class', 'rect_has_no_data');

      legend.append('text')
          .attr('x', width + margin.right - 150 + 20)
          .attr('y', paddingTopHeading + 8.5 + 15 + 2)
          .text('No data available')
          .attr('class', 'legend');
    });
  }

  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.drawTitle = function (_) {
    if (!arguments.length) return drawTitle;
    drawTitle = _;
    return chart;
  };

  chart.maxDisplayDatasets = function (_) {
    if (!arguments.length) return maxDisplayDatasets;
    maxDisplayDatasets = _;
    return chart;
  };

  chart.curDisplayFirstDataset = function (_) {
    if (!arguments.length) return curDisplayFirstDataset;
    curDisplayFirstDataset = _;
    return chart;
  };

  chart.emphasizeYearTicks = function (_) {
    if (!arguments.length) return emphasizeYearTicks;
    emphasizeYearTicks = _;
    return chart;
  };

  return chart;
}

export class AvailabilityView extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      activeTab: 'eventsTab'
    };
  
    this.handleTabChange = this.handleTabChange.bind(this);
    this.drawEventsTab = this.drawEventsTab.bind(this);
    this.drawAvailTab = this.drawAvailTab.bind(this);
  }

  componentDidUpdate() {
    if (this.state.activeTab === 'eventsTab') {
      this.drawEventsTab();
    }
    else if (this.state.activeTab === 'availTab') {
      console.log('changing to availTab');
      this.drawAvailTab();
    }
  }

  handleTabChange(tab, ev) {
    ev.preventDefault();

    this.setState({
      activeTab: tab
    });
  }

  drawEventsTab() {
    agent.post('http://ec2-54-201-243-42.us-west-2.compute.amazonaws.com:5001/api/v1/arrival-rates')
      .send(this.props.chart.filters)
      .set('Accept', 'application/json')
      .end((err, response) => {
        if (err) {
          return reject(err);
        }

        const dataset = response.body;
        const el = document.getElementById('events-chart');
        document.getElementById('eventsTabSpinner').style.display = 'none';

        function truncate(str, maxLength, suffix) {
          if(str.length > maxLength) {
            str = str.substring(0, maxLength + 1); 
            str = str.substring(0, Math.min(str.length, str.lastIndexOf(' ')));
            str = str + suffix;
          }
          return str;
        }

        let formatter;
        if (this.props.chart.filters.grouping === 'hourly') {
          formatter = d3.time.format('%m-%d %H');
        }
        else if (this.props.chart.filters.grouping === 'daily') {
          formatter = d3.time.format('%m-%d');
        }
        else if (this.props.chart.filters.grouping === 'weekly') {
          formatter = d3.time.format('%m-%d');
        }
        else if (this.props.chart.filters.grouping === 'monthly') {
          formatter = d3.time.format('%b');
        }

        const margin = {top: 20, right: 200, bottom: 0, left: 20};
        const width = el.clientWidth - margin.left - margin.right; 
        const height = 250 - margin.top - margin.bottom;

        const c = d3.scale.category20c();

        const x = d3.time.scale()
          .domain([new Date(dataset.minDate), new Date(dataset.maxDate)])
          .range([0, width]);

        const xAxis = d3.svg.axis()
          .scale(x)
          .orient('top')
          .tickFormat(formatter);

        const svg = d3.select(el)
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('margin-left', margin.left + 'px')
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        const xScale = d3.scale.linear()
          .domain(x.domain())
          .range([0, width]);

        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + 0 + ')')
          .call(xAxis);

        for (var j = 0; j < dataset.data.length; j++) {
          const g = svg.append('g').attr('class', 'measurement');

          const circles = g.selectAll('circle')
            .data(dataset.data[j]['measurements'])
            .enter()
            .append('circle');

          const text = g.selectAll('text')
            .data(dataset.data[j]['measurements'])
            .enter()
            .append('text');

          const rScale = d3.scale.linear()
            .domain([0, d3.max(dataset.data[j]['measurements'], function(d) { return d[1]; })])
            .range([2, 15]);

          circles
            .attr('cx', function(d, i) { return xScale(new Date(d[0])); })
            .attr('cy', j * 20 + 20)
            .attr('r', function(d) { return rScale(d[1]); })
            .style('fill', function(d) { return c(j); });

          text
            .attr('y', j * 20 + 25)
            .attr('x',function(d, i) { return xScale(new Date(d[0])) - 5; })
            .attr('class', 'value')
            .text(function(d) { return d[1]; })
            .style('fill', function(d) { return c(j); })
            .style('display', 'none');

          g.append('text')
            .attr('y', j * 20 + 25)
            .attr('x',width + 20)
            .attr('class', 'label')
            .style('font-size', '14px')
            .text(truncate(dataset.data[j]['name'], 30, '...'))
            .style('fill', function(d) { return c(j); })
            .on('mouseover', mouseover)
            .on('mouseout', mouseout);
        }

        function mouseover(p) {
          var g = d3.select(this).node().parentNode;
          d3.select(g).selectAll("circle").style("display","none");
          d3.select(g).selectAll("text.value").style("display","block");
        }

        function mouseout(p) {
          var g = d3.select(this).node().parentNode;
          d3.select(g).selectAll("circle").style("display","block");
          d3.select(g).selectAll("text.value").style("display","none");
        }
      });
  }

  drawAvailTab() {
    agent.post('http://ec2-54-201-243-42.us-west-2.compute.amazonaws.com:5001/api/v1/sensor-availability')
      .send(this.props.chart.filters)
      .set('Accept', 'application/json')
      .end((err, response) => {
        if (err) {
          return reject(err);
        }

        const el = document.getElementById('availability-chart');
        document.getElementById('availTabSpinner').style.display = 'none';

        const dataset = response.body;
        console.log('my data', dataset);
        const chart = visavailChart().width(el.clientWidth - 200);
        d3.select('#availability-chart')
          .datum(dataset.data)
          .call(chart);
      });
  }

  render() {
    return (
      <div className="main-container">
        <div className="row">
          <div className="col-xs-12" style={{padding: '25px'}}>
            <ul className="nav nav-tabs font-12" style={{borderBottomColor: '#95a4b8'}}>
              <li className={'avail-tab ' + (this.state.activeTab === 'eventsTab' ? 'active' : '')}>
                <a onClick={(ev) => this.handleTabChange('eventsTab', ev)} href="#">Recieve Events</a>
              </li>
              <li className={'avail-tab ' + (this.state.activeTab === 'availTab' ? 'active' : '')}>
                <a onClick={(ev) => this.handleTabChange('availTab', ev)} href="#">Data Availability</a>
              </li>
            </ul>
            <div className="tab-content b-all no-b-t p-20 font-12" style={{border: '1px solid #95a4b8'}}>
              <div className={'tab-pane fade ' + (this.state.activeTab === 'eventsTab' ? 'in active' : '')} id="eventsTab">
                <div id="eventsTabSpinner" style={{textAlign: 'center'}}>
                  <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i> Processing millions of sensor readings....
                </div>
                <div id="events-chart"></div>
              </div>
              <div className={'tab-pane fade ' + (this.state.activeTab === 'availTab' ? 'in active' : '')} id="availTab">
                <div id="availTabSpinner" style={{textAlign: 'center'}}>
                  <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i> Processing millions of sensor readings....
                </div>
                <div id="availability-chart"></div>
              </div>
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
