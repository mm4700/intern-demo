import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';
import agent from 'superagent';

function visavailChart(el) {
  // define chart layout
  var margin = {
    // top margin includes title and legend
    top: 70,

    // right margin should provide space for last horz. axis title
    right: 40,

    bottom: 20,

    // left margin should provide space for y axis titles
    left: 100,
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
  var paddingLeft = -100;

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
      .attr('class', 'visavail tooltip')
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

      // check how data is arranged
      var definedBlocks = 0;
      for (var i = 0; i < dataset.length; i++) {
        if (dataset[i].data[0].length === 3) {
          definedBlocks = 1;
          break;
        }
      }

      // parse data text strings to JavaScript date stamps
      var parseDate = d3.time.format('%Y-%m-%d');
      dataset.forEach(function (d) {
        d.data.forEach(function (d1) {
          if (!(d1[0] instanceof Date)) {
            d1[0] = parseDate.parse(d1[0]);
            if (!definedBlocks) {
              d1[2] = d3.time.second.offset(d1[0], d.interval_s);
            } else {
              d1[2] = parseDate.parse(d1[2]);
            }
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
              if (definedBlocks) {
                if (tmpData[tmpData.length - 1][2].getTime() === d[0].getTime()) {
                  // end of old and start of new block are the same
                  tmpData[tmpData.length - 1][2] = d[2];
                  tmpData[tmpData.length - 1][3] = 1;
                } else {
                  tmpData.push(d);
                }
              } else {
                tmpData[tmpData.length - 1][2] = d[2];
                tmpData[tmpData.length - 1][3] = 1;
              }
            } else {
              // the value has changed since the last date
              d[3] = 0;
              if (!definedBlocks) {
                // extend last block until new block starts
                tmpData[tmpData.length - 1][2] = d[0];
              }
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
      var svg = d3.select(el).append('svg')
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
                return output + moment(parseDate(d[0])).format('l')
                    + ' - ' + moment(parseDate(d[2])).format('l');
              }
              return output + moment(parseDate(d[0])).format('l');
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
            .text('Data Availability Plot')
            .attr('class', 'heading');
      }

      // create subtitle
      svg.select('#g_title')
          .append('text')
          .attr('x', paddingLeft)
          .attr('y', paddingTopHeading + 17)
          .text('from ' + moment(parseDate(startDate)).format('MMMM Y') + ' to '
              + moment(parseDate(endDate)).format('MMMM Y'))
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
  }

  componentWillMount() {
    this.drawEventsTab();
  }

  componentDidUpdate() {
    if (this.state.activeTab === 'eventsTab') {
      this.drawEventsTab();
    }
    else if (this.state.activeTab === 'availTab') {
      this.drawAvailTab();
    }
    else if (this.state.activeTab === 'heatmapTab') {
      this.drawHeatmapTab();
    }
  }

  handleTabChange(tab, index, el) {
    ev.preventDefault();

    this.setState({
      activeTab: tab
    });
  }

  drawEventsTab() {
    agent.post('http://localhost:5001/api/v1/arrival-rates')
      .send(this.props.chart.filters)
      .set('Accept', 'application/json')
      .end((err, response) => {
        if (err) {
          return reject(err);
        }

        this.renderTab1(response.body);
      });
  }

  drawAvailTab() {
    agent.post('http://localhost:5001/api/v1/sensor-availability')
      .send(this.props.chart.filters)
      .set('Accept', 'application/json')
      .end((err, response) => {
        if (err) {
          return reject(err);
        }

        this.renderTab2(response.body);
      });
  }

  renderTab1(dataset) {
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
        .range([2, 9]);

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
  }

  renderTab2(dataset) {
    const el = document.getElementById('availability-chart');
    document.getElementById('availTabSpinner').style.display = 'none';

    var dataset = [{
        "measure": "Balance Sheet",
        "interval_s": 3 * 30.5 * 24 * 60 * 60,
        "data": [
            ["2015-03-31", 0],
            ["2015-06-30", 1],
            ["2015-09-30", 1],
            ["2015-12-31", 1],
            ["2016-03-31", 1],
            ["2016-06-30", 1],
            ["2016-09-30", 1],
            ["2016-12-31", 1],
            ["2017-03-31", 0],
            ["2017-06-30", 1],
            ["2017-09-30", 1],
            ["2017-12-31", 1],
            ["2018-03-31", 1],
            ["2018-06-30", 1],
            ["2018-09-30", 1]
        ]
    }, {
        "measure": "Closing Price",
        "interval_s": 24 * 60 * 60,
        "data": [
            ["2016-01-01", 1],
            ["2016-01-02", 1],
            ["2016-01-03", 1],
            ["2016-01-04", 1],
            ["2016-01-05", 1],
            ["2016-01-06", 1],
            ["2016-01-07", 1],
            ["2016-01-08", 1],
            ["2016-01-09", 1],
            ["2016-01-10", 1],
            ["2016-01-11", 1],
            ["2016-01-12", 1],
            ["2016-01-13", 1],
            ["2016-01-14", 1],
            ["2016-01-15", 1],
            ["2016-01-16", 1],
            ["2016-01-17", 1],
            ["2016-01-18", 1],
            ["2016-01-19", 1],
            ["2016-01-20", 1],
            ["2016-01-21", 1],
            ["2016-01-22", 1],
            ["2016-01-23", 1],
            ["2016-01-24", 1],
            ["2016-01-25", 1],
            ["2016-01-26", 1],
            ["2016-01-27", 1],
            ["2016-01-28", 1],
            ["2016-01-29", 1],
            ["2016-01-30", 1],
            ["2016-01-31", 1],
            ["2016-02-01", 1],
            ["2016-02-02", 1],
            ["2016-02-03", 1],
            ["2016-02-04", 1],
            ["2016-02-05", 1],
            ["2016-02-06", 1],
            ["2016-02-07", 1],
            ["2016-02-08", 1],
            ["2016-02-09", 1],
            ["2016-02-10", 1],
            ["2016-02-11", 1],
            ["2016-02-12", 1],
            ["2016-02-13", 0],
            ["2016-02-14", 1],
            ["2016-02-15", 1],
            ["2016-02-16", 1],
            ["2016-02-17", 1],
            ["2016-02-18", 1],
            ["2016-02-19", 1],
            ["2016-02-20", 1],
            ["2016-02-21", 1],
            ["2016-02-22", 1],
            ["2016-02-23", 1],
            ["2016-02-24", 1],
            ["2016-02-25", 1],
            ["2016-02-26", 1],
            ["2016-02-27", 1],
            ["2016-02-28", 1],
            ["2016-02-29", 0],
            ["2016-03-01", 1],
            ["2016-03-02", 1],
            ["2016-03-03", 1],
            ["2016-03-04", 1],
            ["2016-03-05", 1],
            ["2016-03-06", 1],
            ["2016-03-07", 1],
            ["2016-03-08", 1],
            ["2016-03-09", 1],
            ["2016-03-10", 1],
            ["2016-03-11", 1],
            ["2016-03-12", 1],
            ["2016-03-13", 1],
            ["2016-03-14", 1],
            ["2016-03-15", 1],
            ["2016-03-16", 1],
            ["2016-03-17", 1],
            ["2016-03-18", 1],
            ["2016-03-19", 1],
            ["2016-03-20", 1],
            ["2016-03-21", 1],
            ["2016-03-22", 1],
            ["2016-03-23", 1],
            ["2016-03-24", 1],
            ["2016-03-25", 1],
            ["2016-03-26", 1],
            ["2016-03-27", 1],
            ["2016-03-28", 1],
            ["2016-03-29", 1],
            ["2016-03-30", 1],
            ["2016-03-31", 1],
            ["2016-04-01", 1],
            ["2016-04-02", 1],
            ["2016-04-03", 1],
            ["2016-04-04", 1],
            ["2016-04-05", 1],
            ["2016-04-06", 1],
            ["2016-04-07", 1],
            ["2016-04-08", 1],
            ["2016-04-09", 1],
            ["2016-04-10", 1],
            ["2016-04-11", 1],
            ["2016-04-12", 1],
            ["2016-04-13", 1],
            ["2016-04-14", 1],
            ["2016-04-15", 1],
            ["2016-04-16", 1],
            ["2016-04-17", 0],
            ["2016-04-18", 1],
            ["2016-04-19", 1],
            ["2016-04-20", 1],
            ["2016-04-21", 1],
            ["2016-04-22", 0],
            ["2016-04-23", 1],
            ["2016-04-24", 1],
            ["2016-04-25", 1],
            ["2016-04-26", 1],
            ["2016-04-27", 1],
            ["2016-04-28", 1],
            ["2016-04-29", 1],
            ["2016-04-30", 1],
            ["2016-05-01", 1],
            ["2016-05-02", 1],
            ["2016-05-03", 1],
            ["2016-05-04", 1],
            ["2016-05-05", 1],
            ["2016-05-06", 1],
            ["2016-05-07", 1],
            ["2016-05-08", 1],
            ["2016-05-09", 1],
            ["2016-05-10", 1],
            ["2016-05-11", 1],
            ["2016-05-12", 0],
            ["2016-05-13", 1],
            ["2016-05-14", 1],
            ["2016-05-15", 1],
            ["2016-05-16", 1],
            ["2016-05-17", 1],
            ["2016-05-18", 1],
            ["2016-05-19", 1],
            ["2016-05-20", 1],
            ["2016-05-21", 1],
            ["2016-05-22", 1],
            ["2016-05-23", 1],
            ["2016-05-24", 1],
            ["2016-05-25", 1],
            ["2016-05-26", 1],
            ["2016-05-27", 1],
            ["2016-05-28", 1],
            ["2016-05-29", 1],
            ["2016-05-30", 1],
            ["2016-05-31", 1],
            ["2016-06-01", 1],
            ["2016-06-02", 1],
            ["2016-06-03", 1],
            ["2016-06-04", 0],
            ["2016-06-05", 0],
            ["2016-06-06", 1],
            ["2016-06-07", 1],
            ["2016-06-08", 1],
            ["2016-06-09", 1],
            ["2016-06-10", 1],
            ["2016-06-11", 1],
            ["2016-06-12", 1],
            ["2016-06-13", 0],
            ["2016-06-14", 1],
            ["2016-06-15", 1],
            ["2016-06-16", 1],
            ["2016-06-17", 1],
            ["2016-06-18", 1],
            ["2016-06-19", 1],
            ["2016-06-20", 1],
            ["2016-06-21", 0],
            ["2016-06-22", 1],
            ["2016-06-23", 1],
            ["2016-06-24", 1],
            ["2016-06-25", 1],
            ["2016-06-26", 1],
            ["2016-06-27", 1],
            ["2016-06-28", 0],
            ["2016-06-29", 1],
            ["2016-06-30", 1],
            ["2016-07-01", 1],
            ["2016-07-02", 1],
            ["2016-07-03", 1],
            ["2016-07-04", 1],
            ["2016-07-05", 1],
            ["2016-07-06", 1],
            ["2016-07-07", 1],
            ["2016-07-08", 1],
            ["2016-07-09", 1],
            ["2016-07-10", 1],
            ["2016-07-11", 1],
            ["2016-07-12", 1],
            ["2016-07-13", 1],
            ["2016-07-14", 1],
            ["2016-07-15", 1],
            ["2016-07-16", 0],
            ["2016-07-17", 1],
            ["2016-07-18", 1],
            ["2016-07-19", 1],
            ["2016-07-20", 1],
            ["2016-07-21", 1],
            ["2016-07-22", 1],
            ["2016-07-23", 1],
            ["2016-07-24", 1],
            ["2016-07-25", 1],
            ["2016-07-26", 1],
            ["2016-07-27", 1],
            ["2016-07-28", 1],
            ["2016-07-29", 1],
            ["2016-07-30", 1],
            ["2016-07-31", 1],
            ["2016-08-01", 1],
            ["2016-08-02", 1],
            ["2016-08-03", 1],
            ["2016-08-04", 1],
            ["2016-08-05", 1],
            ["2016-08-06", 1],
            ["2016-08-07", 1],
            ["2016-08-08", 1],
            ["2016-08-09", 1],
            ["2016-08-10", 1],
            ["2016-08-11", 1],
            ["2016-08-12", 1],
            ["2016-08-13", 1],
            ["2016-08-14", 1],
            ["2016-08-15", 1],
            ["2016-08-16", 1],
            ["2016-08-17", 1],
            ["2016-08-18", 1],
            ["2016-08-19", 1],
            ["2016-08-20", 1],
            ["2016-08-21", 1],
            ["2016-08-22", 1],
            ["2016-08-23", 1],
            ["2016-08-24", 1],
            ["2016-08-25", 1],
            ["2016-08-26", 1],
            ["2016-08-27", 1],
            ["2016-08-28", 1],
            ["2016-08-29", 1],
            ["2016-08-30", 1],
            ["2016-08-31", 1],
            ["2016-09-01", 1],
            ["2016-09-02", 1],
            ["2016-09-03", 1],
            ["2016-09-04", 1],
            ["2016-09-05", 1],
            ["2016-09-06", 1],
            ["2016-09-07", 1],
            ["2016-09-08", 1],
            ["2016-09-09", 1],
            ["2016-09-10", 1],
            ["2016-09-11", 1],
            ["2016-09-12", 1],
            ["2016-09-13", 1],
            ["2016-09-14", 1],
            ["2016-09-15", 1],
            ["2016-09-16", 1],
            ["2016-09-17", 1],
            ["2016-09-18", 1],
            ["2016-09-19", 1],
            ["2016-09-20", 1],
            ["2016-09-21", 1],
            ["2016-09-22", 1],
            ["2016-09-23", 1],
            ["2016-09-24", 1],
            ["2016-09-25", 1],
            ["2016-09-26", 1],
            ["2016-09-27", 1],
            ["2016-09-28", 1],
            ["2016-09-29", 1],
            ["2016-09-30", 1],
            ["2016-10-01", 1],
            ["2016-10-02", 1],
            ["2016-10-03", 1],
            ["2016-10-04", 1],
            ["2016-10-05", 1],
            ["2016-10-06", 1],
            ["2016-10-07", 1],
            ["2016-10-08", 1],
            ["2016-10-09", 1],
            ["2016-10-10", 1],
            ["2016-10-11", 1],
            ["2016-10-12", 1],
            ["2016-10-13", 1],
            ["2016-10-14", 1],
            ["2016-10-15", 1],
            ["2016-10-16", 1],
            ["2016-10-17", 1],
            ["2016-10-18", 1],
            ["2016-10-19", 1],
            ["2016-10-20", 1],
            ["2016-10-21", 1],
            ["2016-10-22", 1],
            ["2016-10-23", 1],
            ["2016-10-24", 1],
            ["2016-10-25", 1],
            ["2016-10-26", 1],
            ["2016-10-27", 1],
            ["2016-10-28", 1],
            ["2016-10-29", 1],
            ["2016-10-30", 0],
            ["2016-10-31", 1],
            ["2016-11-01", 1],
            ["2016-11-02", 1],
            ["2016-11-03", 1],
            ["2016-11-04", 1],
            ["2016-11-05", 1],
            ["2016-11-06", 1],
            ["2016-11-07", 1],
            ["2016-11-08", 1],
            ["2016-11-09", 1],
            ["2016-11-10", 1],
            ["2016-11-11", 1],
            ["2016-11-12", 1],
            ["2016-11-13", 1],
            ["2016-11-14", 1],
            ["2016-11-15", 1],
            ["2016-11-16", 1],
            ["2016-11-17", 1],
            ["2016-11-18", 1],
            ["2016-11-19", 1],
            ["2016-11-20", 1],
            ["2016-11-21", 1],
            ["2016-11-22", 1],
            ["2016-11-23", 1],
            ["2016-11-24", 1],
            ["2016-11-25", 1],
            ["2016-11-26", 1],
            ["2016-11-27", 1],
            ["2016-11-28", 1],
            ["2016-11-29", 0],
            ["2016-11-30", 1],
            ["2016-12-01", 1],
            ["2016-12-02", 1],
            ["2016-12-03", 1],
            ["2016-12-04", 1],
            ["2016-12-05", 1],
            ["2016-12-06", 1],
            ["2016-12-07", 1],
            ["2016-12-08", 1],
            ["2016-12-09", 0],
            ["2016-12-10", 1],
            ["2016-12-11", 1],
            ["2016-12-12", 1],
            ["2016-12-13", 1],
            ["2016-12-14", 1],
            ["2016-12-15", 1],
            ["2016-12-16", 1],
            ["2016-12-17", 1],
            ["2016-12-18", 1],
            ["2016-12-19", 1],
            ["2016-12-20", 1],
            ["2016-12-21", 1],
            ["2016-12-22", 1],
            ["2016-12-23", 1],
            ["2016-12-24", 1],
            ["2016-12-25", 1],
            ["2016-12-26", 1],
            ["2016-12-27", 1],
            ["2016-12-28", 1],
            ["2016-12-29", 1],
            ["2016-12-30", 0],
            ["2016-12-31", 1],
            ["2017-01-01", 1],
            ["2017-01-02", 1],
            ["2017-01-03", 1],
            ["2017-01-04", 0],
            ["2017-01-05", 0],
            ["2017-01-06", 1],
            ["2017-01-07", 1],
            ["2017-01-08", 1],
            ["2017-01-09", 1],
            ["2017-01-10", 1],
            ["2017-01-11", 1],
            ["2017-01-12", 1],
            ["2017-01-13", 1],
            ["2017-01-14", 1],
            ["2017-01-15", 1],
            ["2017-01-16", 1],
            ["2017-01-17", 1],
            ["2017-01-18", 1],
            ["2017-01-19", 1],
            ["2017-01-20", 1],
            ["2017-01-21", 1],
            ["2017-01-22", 1],
            ["2017-01-23", 1],
            ["2017-01-24", 1],
            ["2017-01-25", 1],
            ["2017-01-26", 1],
            ["2017-01-27", 1],
            ["2017-01-28", 1],
            ["2017-01-29", 0],
            ["2017-01-30", 1],
            ["2017-01-31", 1],
            ["2017-02-01", 1],
            ["2017-02-02", 0],
            ["2017-02-03", 1],
            ["2017-02-04", 1],
            ["2017-02-05", 1],
            ["2017-02-06", 1],
            ["2017-02-07", 1],
            ["2017-02-08", 1],
            ["2017-02-09", 0],
            ["2017-02-10", 1],
            ["2017-02-11", 1],
            ["2017-02-12", 1],
            ["2017-02-13", 1],
            ["2017-02-14", 1],
            ["2017-02-15", 1],
            ["2017-02-16", 1],
            ["2017-02-17", 1],
            ["2017-02-18", 1],
            ["2017-02-19", 1],
            ["2017-02-20", 1],
            ["2017-02-21", 1],
            ["2017-02-22", 1],
            ["2017-02-23", 1],
            ["2017-02-24", 1],
            ["2017-02-25", 1],
            ["2017-02-26", 1],
            ["2017-02-27", 1],
            ["2017-02-28", 0],
            ["2017-03-01", 1],
            ["2017-03-02", 1],
            ["2017-03-03", 1],
            ["2017-03-04", 1],
            ["2017-03-05", 1],
            ["2017-03-06", 0],
            ["2017-03-07", 1],
            ["2017-03-08", 1],
            ["2017-03-09", 1],
            ["2017-03-10", 1],
            ["2017-03-11", 1],
            ["2017-03-12", 1],
            ["2017-03-13", 1],
            ["2017-03-14", 0],
            ["2017-03-15", 1],
            ["2017-03-16", 1],
            ["2017-03-17", 1],
            ["2017-03-18", 1],
            ["2017-03-19", 1],
            ["2017-03-20", 1],
            ["2017-03-21", 1],
            ["2017-03-22", 1],
            ["2017-03-23", 1],
            ["2017-03-24", 1],
            ["2017-03-25", 1],
            ["2017-03-26", 1],
            ["2017-03-27", 1],
            ["2017-03-28", 1],
            ["2017-03-29", 1],
            ["2017-03-30", 1],
            ["2017-03-31", 0],
            ["2017-04-01", 1],
            ["2017-04-02", 0],
            ["2017-04-03", 1],
            ["2017-04-04", 1],
            ["2017-04-05", 1],
            ["2017-04-06", 1],
            ["2017-04-07", 1],
            ["2017-04-08", 1],
            ["2017-04-09", 1],
            ["2017-04-10", 1],
            ["2017-04-11", 1],
            ["2017-04-12", 1],
            ["2017-04-13", 1],
            ["2017-04-14", 1],
            ["2017-04-15", 1],
            ["2017-04-16", 1],
            ["2017-04-17", 1],
            ["2017-04-18", 1],
            ["2017-04-19", 0],
            ["2017-04-20", 1],
            ["2017-04-21", 1],
            ["2017-04-22", 1],
            ["2017-04-23", 1],
            ["2017-04-24", 1],
            ["2017-04-25", 1],
            ["2017-04-26", 1],
            ["2017-04-27", 1],
            ["2017-04-28", 1],
            ["2017-04-29", 1],
            ["2017-04-30", 1],
            ["2017-05-01", 1],
            ["2017-05-02", 1],
            ["2017-05-03", 1],
            ["2017-05-04", 1],
            ["2017-05-05", 1],
            ["2017-05-06", 1],
            ["2017-05-07", 1],
            ["2017-05-08", 1],
            ["2017-05-09", 1],
            ["2017-05-10", 1],
            ["2017-05-11", 0],
            ["2017-05-12", 1],
            ["2017-05-13", 1],
            ["2017-05-14", 1],
            ["2017-05-15", 1],
            ["2017-05-16", 1],
            ["2017-05-17", 1],
            ["2017-05-18", 1],
            ["2017-05-19", 1],
            ["2017-05-20", 1],
            ["2017-05-21", 1],
            ["2017-05-22", 1],
            ["2017-05-23", 1],
            ["2017-05-24", 1],
            ["2017-05-25", 1],
            ["2017-05-26", 1],
            ["2017-05-27", 1],
            ["2017-05-28", 1],
            ["2017-05-29", 1],
            ["2017-05-30", 1],
            ["2017-05-31", 1],
            ["2017-06-01", 1],
            ["2017-06-02", 1],
            ["2017-06-03", 1],
            ["2017-06-04", 1],
            ["2017-06-05", 1],
            ["2017-06-06", 1],
            ["2017-06-07", 1],
            ["2017-06-08", 1],
            ["2017-06-09", 1],
            ["2017-06-10", 1],
            ["2017-06-11", 1],
            ["2017-06-12", 1],
            ["2017-06-13", 1],
            ["2017-06-14", 1],
            ["2017-06-15", 1],
            ["2017-06-16", 1],
            ["2017-06-17", 1],
            ["2017-06-18", 1],
            ["2017-06-19", 1],
            ["2017-06-20", 1],
            ["2017-06-21", 1],
            ["2017-06-22", 1],
            ["2017-06-23", 1],
            ["2017-06-24", 1],
            ["2017-06-25", 1],
            ["2017-06-26", 1],
            ["2017-06-27", 1],
            ["2017-06-28", 1],
            ["2017-06-29", 1],
            ["2017-06-30", 1],
            ["2017-07-01", 1],
            ["2017-07-02", 1],
            ["2017-07-03", 1],
            ["2017-07-04", 1],
            ["2017-07-05", 1],
            ["2017-07-06", 1],
            ["2017-07-07", 1],
            ["2017-07-08", 1],
            ["2017-07-09", 1],
            ["2017-07-10", 1],
            ["2017-07-11", 1],
            ["2017-07-12", 1],
            ["2017-07-13", 0],
            ["2017-07-14", 1],
            ["2017-07-15", 1],
            ["2017-07-16", 1],
            ["2017-07-17", 1],
            ["2017-07-18", 1],
            ["2017-07-19", 1],
            ["2017-07-20", 1],
            ["2017-07-21", 1],
            ["2017-07-22", 1],
            ["2017-07-23", 1],
            ["2017-07-24", 1],
            ["2017-07-25", 1],
            ["2017-07-26", 1],
            ["2017-07-27", 1],
            ["2017-07-28", 1],
            ["2017-07-29", 1],
            ["2017-07-30", 1],
            ["2017-07-31", 1],
            ["2017-08-01", 1],
            ["2017-08-02", 1],
            ["2017-08-03", 1],
            ["2017-08-04", 1],
            ["2017-08-05", 1],
            ["2017-08-06", 1],
            ["2017-08-07", 1],
            ["2017-08-08", 1],
            ["2017-08-09", 1],
            ["2017-08-10", 0],
            ["2017-08-11", 1],
            ["2017-08-12", 1],
            ["2017-08-13", 1],
            ["2017-08-14", 1],
            ["2017-08-15", 1],
            ["2017-08-16", 1],
            ["2017-08-17", 1],
            ["2017-08-18", 1],
            ["2017-08-19", 1],
            ["2017-08-20", 1],
            ["2017-08-21", 1],
            ["2017-08-22", 1],
            ["2017-08-23", 1],
            ["2017-08-24", 1],
            ["2017-08-25", 1],
            ["2017-08-26", 1],
            ["2017-08-27", 1],
            ["2017-08-28", 0],
            ["2017-08-29", 1],
            ["2017-08-30", 1],
            ["2017-08-31", 1],
            ["2017-09-01", 1],
            ["2017-09-02", 1],
            ["2017-09-03", 1],
            ["2017-09-04", 1],
            ["2017-09-05", 1],
            ["2017-09-06", 1],
            ["2017-09-07", 1],
            ["2017-09-08", 1],
            ["2017-09-09", 1],
            ["2017-09-10", 1],
            ["2017-09-11", 1],
            ["2017-09-12", 1],
            ["2017-09-13", 1],
            ["2017-09-14", 1],
            ["2017-09-15", 1],
            ["2017-09-16", 0],
            ["2017-09-17", 1],
            ["2017-09-18", 1],
            ["2017-09-19", 1],
            ["2017-09-20", 1],
            ["2017-09-21", 1],
            ["2017-09-22", 1]
        ]
    }, {
        "measure": "Weekly Report",
        "interval_s": 7 * 24 * 60 * 60,
        "data": [
            ["2014-07-07", 1],
            ["2014-07-14", 1],
            ["2014-07-21", 1],
            ["2014-07-28", 1],
            ["2014-08-04", 1],
            ["2014-08-11", 0],
            ["2014-08-18", 1],
            ["2014-08-25", 0],
            ["2014-09-01", 1],
            ["2014-09-08", 1],
            ["2014-09-15", 1],
            ["2014-09-22", 1],
            ["2014-09-29", 0],
            ["2014-10-06", 1],
            ["2014-10-13", 0],
            ["2014-10-20", 1],
            ["2014-10-27", 1],
            ["2014-11-03", 1],
            ["2014-11-10", 1],
            ["2014-11-17", 1],
            ["2014-11-24", 1],
            ["2014-12-01", 1],
            ["2014-12-08", 1],
            ["2014-12-15", 0],
            ["2014-12-22", 1],
            ["2014-12-29", 1],
            ["2015-01-05", 0],
            ["2015-01-12", 1],
            ["2015-01-19", 1],
            ["2015-01-26", 0],
            ["2015-02-02", 1],
            ["2015-02-09", 0],
            ["2015-02-16", 1],
            ["2015-02-23", 1],
            ["2015-03-02", 1],
            ["2015-03-09", 1],
            ["2015-03-16", 1],
            ["2015-03-23", 1],
            ["2015-03-30", 1],
            ["2015-04-06", 1],
            ["2015-04-13", 0],
            ["2015-04-20", 1],
            ["2015-04-27", 0],
            ["2015-05-04", 1],
            ["2015-05-11", 1],
            ["2015-05-18", 1],
            ["2015-05-25", 0],
            ["2015-06-01", 1],
            ["2015-06-08", 0],
            ["2015-06-15", 1],
            ["2015-06-22", 1],
            ["2015-06-29", 1],
            ["2015-07-06", 1],
            ["2015-07-13", 1],
            ["2015-07-20", 1],
            ["2015-07-27", 0],
            ["2015-08-03", 1],
            ["2015-08-10", 1],
            ["2015-08-17", 1],
            ["2015-08-24", 1],
            ["2015-08-31", 1],
            ["2015-09-07", 1],
            ["2015-09-14", 1],
            ["2015-09-21", 1],
            ["2015-09-28", 1],
            ["2015-10-05", 1],
            ["2015-10-12", 1],
            ["2015-10-19", 1],
            ["2015-10-26", 1],
            ["2015-11-02", 1],
            ["2015-11-09", 0],
            ["2015-11-16", 1],
            ["2015-11-23", 1],
            ["2015-11-30", 1],
            ["2015-12-07", 1],
            ["2015-12-14", 1],
            ["2015-12-21", 1],
            ["2015-12-28", 1],
            ["2016-01-04", 1],
            ["2016-01-11", 1],
            ["2016-01-18", 0],
            ["2016-01-25", 1],
            ["2016-02-01", 1],
            ["2016-02-08", 1],
            ["2016-02-15", 1],
            ["2016-02-22", 1],
            ["2016-02-29", 1],
            ["2016-03-07", 1],
            ["2016-03-14", 0],
            ["2016-03-21", 1],
            ["2016-03-28", 1],
            ["2016-04-04", 1],
            ["2016-04-11", 0],
            ["2016-04-18", 1],
            ["2016-04-25", 1],
            ["2016-05-02", 1],
            ["2016-05-09", 1],
            ["2016-05-16", 1],
            ["2016-05-23", 1],
            ["2016-05-30", 0],
            ["2016-06-06", 1],
            ["2016-06-13", 0],
            ["2016-06-20", 1],
            ["2016-06-27", 1],
            ["2016-07-04", 1],
            ["2016-07-11", 1],
            ["2016-07-18", 0],
            ["2016-07-25", 1],
            ["2016-08-01", 1],
            ["2016-08-08", 1],
            ["2016-08-15", 0],
            ["2016-08-22", 1],
            ["2016-08-29", 1],
            ["2016-09-05", 1],
            ["2016-09-12", 1],
            ["2016-09-19", 0],
            ["2016-09-26", 1],
            ["2016-10-03", 1],
            ["2016-10-10", 0],
            ["2016-10-17", 1],
            ["2016-10-24", 1],
            ["2016-10-31", 1],
            ["2016-11-07", 1],
            ["2016-11-14", 0],
            ["2016-11-21", 1],
            ["2016-11-28", 1],
            ["2016-12-05", 0],
            ["2016-12-12", 1],
            ["2016-12-19", 1],
            ["2016-12-26", 1],
            ["2017-01-02", 1],
            ["2017-01-09", 0],
            ["2017-01-16", 1],
            ["2017-01-23", 0],
            ["2017-01-30", 1],
            ["2017-02-06", 1],
            ["2017-02-13", 1],
            ["2017-02-20", 1],
            ["2017-02-27", 1],
            ["2017-03-06", 1],
            ["2017-03-13", 1],
            ["2017-03-20", 1],
            ["2017-03-27", 0],
            ["2017-04-03", 1],
            ["2017-04-10", 1],
            ["2017-04-17", 1],
            ["2017-04-24", 1],
            ["2017-05-01", 1],
            ["2017-05-08", 1],
            ["2017-05-15", 0],
            ["2017-05-22", 0],
            ["2017-05-29", 1],
            ["2017-06-05", 0],
            ["2017-06-12", 1],
            ["2017-06-19", 1],
            ["2017-06-26", 1],
            ["2017-07-03", 1],
            ["2017-07-10", 0],
            ["2017-07-17", 1],
            ["2017-07-24", 1],
            ["2017-07-31", 1],
            ["2017-08-07", 0],
            ["2017-08-14", 1],
            ["2017-08-21", 1],
            ["2017-08-28", 1],
            ["2017-09-04", 1],
            ["2017-09-11", 1],
            ["2017-09-18", 1],
            ["2017-09-25", 1],
            ["2017-10-02", 0],
            ["2017-10-09", 1],
            ["2017-10-16", 1],
            ["2017-10-23", 1],
            ["2017-10-30", 1],
            ["2017-11-06", 1],
            ["2017-11-13", 0],
            ["2017-11-20", 1],
            ["2017-11-27", 0],
            ["2017-12-04", 1],
            ["2017-12-11", 1],
            ["2017-12-18", 1],
            ["2017-12-25", 1],
            ["2018-01-01", 1],
            ["2018-01-08", 1],
            ["2018-01-15", 0],
            ["2018-01-22", 1],
            ["2018-01-29", 1],
            ["2018-02-05", 1],
            ["2018-02-12", 0],
            ["2018-02-19", 1],
            ["2018-02-26", 1],
            ["2018-03-05", 1],
            ["2018-03-12", 1],
            ["2018-03-19", 1],
            ["2018-03-26", 1],
            ["2018-04-02", 0],
            ["2018-04-09", 1],
            ["2018-04-16", 1],
            ["2018-04-23", 1],
            ["2018-04-30", 1],
            ["2018-05-07", 0],
            ["2018-05-14", 1],
            ["2018-05-21", 1],
            ["2018-05-28", 0],
            ["2018-06-04", 1],
            ["2018-06-11", 1],
            ["2018-06-18", 0],
            ["2018-06-25", 1],
            ["2018-07-02", 0],
            ["2018-07-09", 1],
            ["2018-07-16", 1],
            ["2018-07-23", 1],
            ["2018-07-30", 0],
            ["2018-08-06", 1],
            ["2018-08-13", 1],
            ["2018-08-20", 1],
            ["2018-08-27", 1],
            ["2018-09-03", 1],
            ["2018-09-10", 1],
            ["2018-09-17", 1],
            ["2018-09-24", 1],
            ["2018-10-01", 1],
            ["2018-10-08", 0],
            ["2018-10-15", 1],
            ["2018-10-22", 0]
        ]
    }, {
        "measure": "Analyst Data",
        "interval_s": 7 * 24 * 60 * 60,
        "data": [
            ["2014-06-28", 1],
            ["2014-07-05", 1],
            ["2014-07-12", 1],
            ["2014-07-19", 1],
            ["2014-07-26", 1],
            ["2014-08-02", 1],
            ["2014-08-09", 1],
            ["2014-08-16", 1],
            ["2014-08-23", 1],
            ["2014-08-30", 1],
            ["2014-09-06", 1],
            ["2014-09-13", 1],
            ["2014-09-20", 1],
            ["2014-09-27", 1],
            ["2014-10-04", 1],
            ["2014-10-11", 1],
            ["2014-10-18", 1],
            ["2014-10-25", 1],
            ["2014-11-01", 1],
            ["2014-11-08", 1],
            ["2014-11-15", 1],
            ["2014-11-22", 1],
            ["2014-11-29", 1],
            ["2014-12-06", 1],
            ["2014-12-13", 1],
            ["2014-12-20", 1],
            ["2014-12-27", 1],
            ["2015-01-03", 1],
            ["2015-01-10", 1],
            ["2015-01-17", 1],
            ["2015-01-24", 1],
            ["2015-01-31", 1],
            ["2015-02-07", 0],
            ["2015-02-14", 1],
            ["2015-02-21", 0],
            ["2015-02-28", 0],
            ["2015-03-07", 1],
            ["2015-03-14", 0],
            ["2015-03-21", 1],
            ["2015-03-28", 1],
            ["2015-04-04", 1],
            ["2015-04-11", 1],
            ["2015-04-18", 1],
            ["2015-04-25", 1],
            ["2015-05-02", 1],
            ["2015-05-09", 1],
            ["2015-05-16", 1],
            ["2015-05-23", 1],
            ["2015-05-30", 0],
            ["2015-06-06", 1],
            ["2015-06-13", 1],
            ["2015-06-20", 1],
            ["2015-06-27", 1],
            ["2015-07-04", 1],
            ["2015-07-11", 1],
            ["2015-07-18", 1],
            ["2015-07-25", 1],
            ["2015-08-01", 1],
            ["2015-08-08", 1],
            ["2015-08-15", 1],
            ["2015-08-22", 1],
            ["2015-08-29", 1],
            ["2015-09-05", 0],
            ["2015-09-12", 1],
            ["2015-09-19", 0],
            ["2015-09-26", 1],
            ["2015-10-03", 1],
            ["2015-10-10", 1],
            ["2015-10-17", 1],
            ["2015-10-24", 1],
            ["2015-10-31", 1],
            ["2015-11-07", 0],
            ["2015-11-14", 1],
            ["2015-11-21", 1],
            ["2015-11-28", 1],
            ["2015-12-05", 1],
            ["2015-12-12", 1],
            ["2015-12-19", 1],
            ["2015-12-26", 1],
            ["2016-01-02", 1],
            ["2016-01-09", 1],
            ["2016-01-16", 1],
            ["2016-01-23", 1],
            ["2016-01-30", 1],
            ["2016-02-06", 1],
            ["2016-02-13", 1],
            ["2016-02-20", 1],
            ["2016-02-27", 1],
            ["2016-03-05", 1],
            ["2016-03-12", 1],
            ["2016-03-19", 1],
            ["2016-03-26", 1],
            ["2016-04-02", 1],
            ["2016-04-09", 1],
            ["2016-04-16", 1],
            ["2016-04-23", 1],
            ["2016-04-30", 1],
            ["2016-05-07", 1],
            ["2016-05-14", 1],
            ["2016-05-21", 1],
            ["2016-05-28", 1],
            ["2016-06-04", 1],
            ["2016-06-11", 1],
            ["2016-06-18", 1],
            ["2016-06-25", 1],
            ["2016-07-02", 1],
            ["2016-07-09", 1],
            ["2016-07-16", 1],
            ["2016-07-23", 1],
            ["2016-07-30", 1],
            ["2016-08-06", 1],
            ["2016-08-13", 1],
            ["2016-08-20", 1],
            ["2016-08-27", 1],
            ["2016-09-03", 1],
            ["2016-09-10", 1],
            ["2016-09-17", 1],
            ["2016-09-24", 1],
            ["2016-10-01", 1],
            ["2016-10-08", 1],
            ["2016-10-15", 1],
            ["2016-10-22", 1],
            ["2016-10-29", 1],
            ["2016-11-05", 1],
            ["2016-11-12", 1],
            ["2016-11-19", 1],
            ["2016-11-26", 1],
            ["2016-12-03", 1],
            ["2016-12-10", 1],
            ["2016-12-17", 1],
            ["2016-12-24", 0],
            ["2016-12-31", 1],
            ["2017-01-07", 1],
            ["2017-01-14", 1],
            ["2017-01-21", 1],
            ["2017-01-28", 1],
            ["2017-02-04", 1],
            ["2017-02-11", 0],
            ["2017-02-18", 0],
            ["2017-02-25", 1],
            ["2017-03-04", 1],
            ["2017-03-11", 1],
            ["2017-03-18", 1],
            ["2017-03-25", 1],
            ["2017-04-01", 1],
            ["2017-04-08", 1],
            ["2017-04-15", 1],
            ["2017-04-22", 1],
            ["2017-04-29", 1],
            ["2017-05-06", 1],
            ["2017-05-13", 1],
            ["2017-05-20", 1],
            ["2017-05-27", 1],
            ["2017-06-03", 0],
            ["2017-06-10", 1],
            ["2017-06-17", 1],
            ["2017-06-24", 1],
            ["2017-07-01", 1],
            ["2017-07-08", 1],
            ["2017-07-15", 1],
            ["2017-07-22", 1],
            ["2017-07-29", 0],
            ["2017-08-05", 1],
            ["2017-08-12", 1],
            ["2017-08-19", 0],
            ["2017-08-26", 1],
            ["2017-09-02", 1],
            ["2017-09-09", 1],
            ["2017-09-16", 1],
            ["2017-09-23", 1],
            ["2017-09-30", 1],
            ["2017-10-07", 1],
            ["2017-10-14", 1],
            ["2017-10-21", 1],
            ["2017-10-28", 1],
            ["2017-11-04", 0],
            ["2017-11-11", 1],
            ["2017-11-18", 1],
            ["2017-11-25", 1],
            ["2017-12-02", 1],
            ["2017-12-09", 1],
            ["2017-12-16", 1],
            ["2017-12-23", 1],
            ["2017-12-30", 1],
            ["2018-01-06", 1],
            ["2018-01-13", 1],
            ["2018-01-20", 1],
            ["2018-01-27", 1],
            ["2018-02-03", 1],
            ["2018-02-10", 1],
            ["2018-02-17", 1],
            ["2018-02-24", 1],
            ["2018-03-03", 1],
            ["2018-03-10", 1],
            ["2018-03-17", 1],
            ["2018-03-24", 1],
            ["2018-03-31", 1],
            ["2018-04-07", 1],
            ["2018-04-14", 1],
            ["2018-04-21", 1],
            ["2018-04-28", 1],
            ["2018-05-05", 1],
            ["2018-05-12", 1],
            ["2018-05-19", 1],
            ["2018-05-26", 0],
            ["2018-06-02", 1],
            ["2018-06-09", 1],
            ["2018-06-16", 1],
            ["2018-06-23", 1],
            ["2018-06-30", 1],
            ["2018-07-07", 1],
            ["2018-07-14", 1],
            ["2018-07-21", 0],
            ["2018-07-28", 1],
            ["2018-08-04", 1],
            ["2018-08-11", 1],
            ["2018-08-18", 1],
            ["2018-08-25", 1],
            ["2018-09-01", 0],
            ["2018-09-08", 1],
            ["2018-09-15", 1],
            ["2018-09-22", 1],
            ["2018-09-29", 1],
            ["2018-10-06", 1],
            ["2018-10-13", 1],
            ["2018-10-20", 1],
            ["2018-10-27", 1],
            ["2018-11-03", 1]
        ]
    }, {
        "measure": "Annual Report",
        "interval_s": 365 * 24 * 60 * 60,
        "data": [
            ["2015-01-01", 0],
            ["2016-01-01", 1],
            ["2017-01-01", 1],
            ["2018-01-01", 1]
        ]
    }];

    const chart = visavailChart().width(el.clientWidth - 100); // define width of chart in px
    d3.select(el)
      .datum(dataset)
      .call(chart);
  }

  render() {
    return (
      <div className="main-container">
        <div className="row">
          <div className="col-xs-12" style={{padding: '25px'}}>
            <ul className="nav nav-tabs font-12" style={{borderBottomColor: '#95a4b8'}}>
              <li className={this.state.activeTab === 'eventsTab' ? 'active' : ''}>
                <a onClick={(ev) => this.handleTabChange('eventsTab', ev)} href="#eventsTab" style={{color: '#7f888f', borderColor: '#607786'}}>Recieve Events</a>
              </li>
              <li className={this.state.activeTab === 'availTab' ? 'active' : ''}>
                <a onClick={(ev) => this.handleTabChange('availTab', ev)} href="#availTab" style={{color: '#f6f9fa', backgroundColor: '#95a4b8', borderColor: '#607786'}}>Data Availability</a>
              </li>
              <li className={this.state.activeTab === 'heatmapTab' ? 'active' : ''}>
                <a onClick={(ev) => this.handleTabChange('heatmapTab', ev)} href="#heatmapTab" style={{color: '#f6f9fa', backgroundColor: '#95a4b8', borderColor: '#607786'}}>Heatmap</a>
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
              <div className={'tab-pane fade ' + (this.state.activeTab === 'heatmapTab' ? 'in active' : '')} id="heatmapTab">
                <div id="heatmapSpinner" style={{textAlign: 'center'}}>
                  <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i> Processing millions of sensor readings....
                </div>
                <div id="heatmap-chart"></div>
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
