import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import * as d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const datasetMap = {
  rp: 'Reservoir Pressure',
  bhp: 'Bore Hole Pressure',
  whp: 'Well Head Pressure',
  bht: 'Bore Hole Temperature',
  wht: 'Well Head Temperature',
  q: 'Flow Rate'
};

export default class HomeView extends Component {
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
    let promises = [];
    Object.keys(this.props.chart.opdatasets).map(k => {
      if (this.props.chart.opdatasets[k]) {
        promises.push(this.props.actions.fetchData(k, this.props.chart));
      }
    });

    Promise.all(promises).then(() => {
      this.drawChart();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.previous) {
      if (nextProps.chart.filters.well !== this.state.previous.well
        || nextProps.chart.filters.startDate !== this.state.previous.startDate
        || nextProps.chart.filters.endDate !== this.state.previous.endDate
        || nextProps.chart.filters.grouping !== this.state.previous.grouping
        || nextProps.chart.filters.aggregate !== this.state.previous.aggregate) {
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
      this.fetchNextData();
    }
    else {
      this.drawChart();
    }

    this.state.previous = Object.assign({}, this.props.chart.filters);
  }

  drawMeasurements(k, primary, x, y) {
    const xMap = d => { return x(new Date(d.dateHour)); };
    const yMap = d => { return y(d.measurement); };

    let sensorMeasurement = this.props.chart.styles.sensorMeasurement;
    primary
      .selectAll('.chart')
      .data(this.props.data[k].filter(d => d.measurement !== null))
      .enter()
      .append('circle')
        .attr('class', 'dot')
        .style('fill', rgbToHex(+sensorMeasurement.fillColor.r, +sensorMeasurement.fillColor.g, +sensorMeasurement.fillColor.b))
        .style('fill-opacity', +sensorMeasurement.fillColor.a)
        .style('stroke', rgbToHex(+sensorMeasurement.strokeColor.r, +sensorMeasurement.strokeColor.g, +sensorMeasurement.strokeColor.b))
        .style('stroke-opacity', +sensorMeasurement.strokeColor.a)
        .style('stroke-width', sensorMeasurement.strokeWidth + 'px')
        .style('stroke-dasharray', sensorMeasurement.dashArray)
        .attr('r', +sensorMeasurement.radius)
        .attr('cx', xMap)
        .attr('cy', yMap)
        .on('mouseover', d => {
          /*tooltip.transition()
            .duration(80)
            .style('opacity', .9)
            .style('left', (d3.event.pageX + 20) + 'px')
            .style('top', (d3.event.pageY - 30) + 'px');
          let dist = 0;
          mydata.data1.forEach(function (n) {
            if (n.date === d.date) {
              dist = d.est - n.estPressure ;
              if (dist < 0) {
                dist = dist * -1;
              }   
            }
          });

          tooltip.html('<h1>' + 'X: ' + d.dateHour + ' Y: ' + d.est.toFixed(2) + ' uncertainty:' + dist.toFixed(3) + '</h1>');*/
        })
        .on('mouseout', d => {
          /*tooltip.transition()
            .duration(200)
            .style('opacity', 0);*/
        });
  }

  drawLegend(el) {
    this.legend =
      this.primary.selectAll('.legend')
        .data(headingsArray)
        .enter()
        .append('g')
          .attr('class', 'legend')
          .attr('transform', (d, i) => { return 'translate(0,' + (i * 20) + ')'; });

    this.legend
      .append('rect')
        .attr('x', width - 10)
        .attr('width', 15)
        .attr('height', 13)
        .style('fill', color);

    this.legend
      .append('text')
        .attr('x', width - 10)
        .attr('y', 6)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .style('stroke', '#777672')
        .on('click', () => {
          const active = linechart.active ? false : true;
          const newOpacity = active ? 0 : 1;
          d3.selectAll(el).style('opacity', newOpacity);
          linechart.active = active; 
        })
        .text(d => { return d; });
  }

  drawEventTimeline() {
    // https://fbe94b5b83362330a8429bb16098a3285147bcbf.googledrive.com/host/0Bz6WHrWac3FrZUtuOExWdlRGVG8//proximitynetwork.html
  }

  drawSensorPlot() {
    // http://phatduino.com.w010a51b.kasserver.com/visavail/example.htm
  }

  drawEdgeCoordinates() {
    // TODO
  }

  drawRadialMenu() {
    // Options
    //  Remove
    //  Info, Model (shows the distrubution curve), Filter, Report
  }

  drawChart() {
    const margin = { top: 25, right: 55, bottom: 100, left: 75 };

    if (this.props.chart.settings.stackCharts) {
      const el = document.getElementById('chart-container');

      /*let headingsArray = [];
      Object.keys(this.props.chart.opdatasets).forEach(k => {
        if (this.props.chart.opdatasets[k]) {
          headingsArray = headingsArray.concat(Object.keys(this.state[k + 'Data'][0]).filter(d => d !== 'date'));
        }
      });*/
    }
    else {
      Object.keys(this.props.chart.opdatasets).map(k => {
        if (this.props.chart.opdatasets[k] && this.props.data[k]) {
          console.log('rendering', k);

          const el = document.getElementById(`${k}-chart`);
          while (el.firstChild) {
            el.removeChild(el.firstChild);
          }

          const width = el.clientWidth - margin.left - margin.right;
          const height = 450 - margin.top - margin.bottom;
    
          const svg = d3.select(el)
            .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

          const minDate = new Date(moment(this.props.chart.filters.startDate, 'MM/DD/YYYY HH:mm').valueOf());
          const maxDate = new Date(moment(this.props.chart.filters.endDate, 'MM/DD/YYYY HH:mm').valueOf());
          const x = d3.time.scale()
            .domain([
              new Date(d3.min(this.props.data[k].map(d => { return d.dateHour; }))),
              new Date(d3.max(this.props.data[k].map(d => { return d.dateHour; })))
            ])
            .range([0, width]);
          
          const y = d3.scale.linear().range([height, 0])
            .domain([
              d3.min(this.props.data[k].map(d => { return _.min([d.est, d.up, d.low, d.measurement]); })),
              d3.max(this.props.data[k].map(d => { return _.max([d.est, d.up, d.low, d.measurement]); }))
            ]);

          let timeFormat = '';
          if (this.props.chart.filters.grouping === 'hourly') {
            timeFormat = '%e/%-m %H';
          }
          else if (this.props.chart.filters.grouping === 'daily') {
            timeFormat = '%e/%-m';
          }
          else if (this.props.chart.filters.grouping === 'weekly') {
            timeFormat = '%e/%-m';
          }
          else if (this.props.chart.filters.grouping === 'monthly') {
            timeFormat = '%B';
          }

          const xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickFormat(d3.time.format(timeFormat)); // @TODO -- Multi Time Formats

          const yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

          const tooltip = d3.select(el)
            .append('div')
              .attr('class', 'tooltip')
              .style('opacity', 0);

          const inferred = this.props.chart.styles.inferred;
          const line = d3.svg.line()
            .interpolate(inferred.interpolation)
            .x(d => {
              return x(new Date(d.dateHour));
            })
            .y(d => {
              return y(d.est);
            });

          // handle band vs bounds here
          let inferredBounds;
          let inferredBand;
          if (this.props.chart.settings.showUncertainityBounds) {
            inferredBounds = [];
            inferredBounds[0] =
              d3.svg.line()
                .interpolate(this.props.chart.styles.inferredUpperBound.interpolation)
                .x(d => {
                  return x(new Date(d.dateHour));
                })
                .y(d => {
                  return y(d.up);
                });

            inferredBounds[1] =
              d3.svg.line()
                .interpolate(this.props.chart.styles.inferredLowerBound.interpolation)
                .x(d => {
                  return x(new Date(d.dateHour));
                })
                .y(d => {
                  return y(d.low);
                });
          }

          if (this.props.chart.settings.showUncertainityBand) {
            inferredBand =
              d3.svg.area()
                .x(d => {
                  return x(new Date(d.dateHour));
                })
                .y0(d => {
                  return y(d.low);
                })
                .y1(d => {
                  return y(d.up);
                });
          }

          const clip = svg
            .append('svg:clipPath')
              .attr('id', 'clip')
              .append('svg:rect')
                .attr('id', 'clip-rect')
                .attr('x', '-10')
                .attr('y', '-10')
                .attr('width', width + 10)
                .attr('height', height + 10);

          const primary = svg
            .append('g')
              .attr('class', 'primary')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

          primary.append('text')
            .attr('x', (width / 2))
            .attr('y', 0 - (margin.top / 2))
            .attr('text-anchor', 'middle')  
            .style('font-size', '16px') 
            .style('text-decoration', 'underline')  
            .text(datasetMap[k]);

          primary.append('path')
            .datum(this.props.data[k])
              .attr('class', 'line')
              .attr('d', line)
              .attr('clip-path', 'url(#clip)')
              .style('fill', 'none')
              .style('stroke', rgbToHex(+inferred.strokeColor.r, +inferred.strokeColor.g, +inferred.strokeColor.b))
              .style('stroke-width', inferred.strokeWidth + 'px')
              .style('stroke-dasharray', inferred.dashArray)
              .style('stroke-opacity', +inferred.strokeColor.a);

          console.log('settings', this.props.chart.settings);
          if (this.props.chart.settings.showUncertainityBounds) {
            const inferredUpperBound = this.props.chart.styles.inferredUpperBound;
            primary.append('path')
              .datum(this.props.data[k])
                .attr('class', 'line')
                .attr('d', inferredBounds[0])
                .attr('clip-path', 'url(#clip)')
                .style('fill', 'none')
                .style('stroke', rgbToHex(+inferredUpperBound.strokeColor.r, +inferredUpperBound.strokeColor.g, +inferredUpperBound.strokeColor.b))
                .style('stroke-width', inferredUpperBound.strokeWidth + 'px')
                .style('stroke-dasharray', inferredUpperBound.dashArray)
                .style('stroke-opacity', +inferredUpperBound.strokeColor.a);

            const inferredLowerBound = this.props.chart.styles.inferredLowerBound;
            primary.append('path')
              .datum(this.props.data[k])
                .attr('class', 'line')
                .attr('d', inferredBounds[1])
                .attr('clip-path', 'url(#clip)')
                .style('fill', 'none')
                .style('stroke', rgbToHex(+inferredLowerBound.strokeColor.r, +inferredLowerBound.strokeColor.g, +inferredLowerBound.strokeColor.b))
                .style('stroke-width', inferredLowerBound.strokeWidth + 'px')
                .style('stroke-dasharray', inferredLowerBound.dashArray)
                .style('stroke-opacity', +inferredLowerBound.strokeColor.a);
          }

          if (this.props.chart.settings.showUncertainityBand) {
            const inferredBandStyles = this.props.chart.styles.inferredBand;
            primary.append('path')
              .datum(this.props.data[k])
                .attr('class', 'area')
                .attr('d', inferredBand)
                .style('fill', rgbToHex(+inferredBandStyles.fillColor.r, +inferredBandStyles.fillColor.g, +inferredBandStyles.fillColor.b))
                .style('fill-opacity', +inferredBandStyles.fillColor.a);
          }

          // highlight the data points
          primary.selectAll('.dot')
            .data(this.props.data[k])
          .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', line.x())
            .attr('cy', line.y())
            .attr('r', 3.5)
            .style('fill', 'white')
            .style('stroke', rgbToHex(+inferred.strokeColor.r, +inferred.strokeColor.g, +inferred.strokeColor.b))
            .style('stroke-width', inferred.strokeWidth + 'px')
            .style('stroke-opacity', +inferred.strokeColor.a);

          primary
            .append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0,' + height + ')')
              .call(xAxis)
              .selectAll('text')
                .attr('transform', function(d) {
                  return 'translate(' + this.getBBox().height*-1 + ',' + this.getBBox().height + ')rotate(-45)';
                });

          primary
            .append('g')
              .attr('class', 'y axis')
              .call(yAxis);

          // Axis Titles
          const padding = (k === 'whp' || k === 'bhp' || k === 'rp') ? 65 : 55;
          primary.append('text')
            .attr('text-anchor', 'middle') 
            .attr('transform', 'translate(' + (padding * -1) + ',' + (height / 2) + ')rotate(-90)')
            .text(k === 'whp' || k === 'bhp' || k === 'rp' ? 'Pressure (PSI)' : k === 'q' ? 'Flow Rate (Mcf)' : 'Temperature (Kelvin)');

          if (k !== 'q') {
            this.drawMeasurements(k, primary, x, y);
          }
        }
      });
    }

    // TODO -- only show if user selected it, need to customize the look n feel
    //drawLegend(el);
  }

  render() {
    console.log('render');

    let charts;
    if (!this.props.chart.settings.stackCharts) {
      const set = Object.keys(this.props.chart.opdatasets).map(k => {
        if (this.props.chart.opdatasets[k]) {
          return <div className="col-xs-12 col-sm-6"><div key={`${k}-chart`} id={`${k}-chart`} style={{margin: '25px'}}></div></div>;
        }
      });

      charts = <div className="row">{set}</div>;
    }
    else {
      charts = <div id="chart-container" style={{margin: '25px'}}></div>;
    }

    return (
      <div className="main-container">
        {charts}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  data: state.data.data,
  chart: state.chart.configuration,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps, undefined, { pure: false })(HomeView);