import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';
import agent from 'superagent';

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
    let sensorMeasurement = this.props.chart.styles.measurement;
    primary
      .selectAll('.chart')
      .data(this.props.data[k].filter(d => d.measurement !== null))
      .enter()
      .append('circle')
        .attr('class', 'measurement')
        .style('fill', rgbToHex(+sensorMeasurement.fillColor.r, +sensorMeasurement.fillColor.g, +sensorMeasurement.fillColor.b))
        .style('fill-opacity', +sensorMeasurement.fillColor.a)
        .style('stroke', rgbToHex(+sensorMeasurement.strokeColor.r, +sensorMeasurement.strokeColor.g, +sensorMeasurement.strokeColor.b))
        .style('stroke-opacity', +sensorMeasurement.strokeColor.a)
        .style('stroke-width', sensorMeasurement.strokeWidth + 'px')
        .style('stroke-dasharray', sensorMeasurement.dashArray)
        .attr('r', +sensorMeasurement.radius)
        .attr('cx', d => { return x(new Date(d.dateHour)); })
        .attr('cy', d => { return y(d.measurement); });
  }

  drawLegend(k, primary) {
    let yOffset = 385;
    if (this.props.chart.settings.enableZoomControl) {
      yOffset += 70;
    }

    let legend =
      primary.append('g')
          .attr('class', 'legend')
          .attr('transform', (d, i) => { return 'translate(0,' + yOffset + ')'; });

    const legendItems = [
      { id: 'inferred', name: 'Inferred' },
      { id: 'inferredUpperBound', name: 'Inferred Upper Bound' },
      { id: 'inferredLowerBound', name: 'Inferred Lower Bound' },
      { id: 'measurement', name: 'Measurement' }
    ];
    
    let nextX = 0;
    _.each(legendItems, (item, i) => {
      legend
        .append('circle')
          .attr('cx', nextX)
          .attr('cy', 4)
          .attr('r', 5)
          .style('fill', rgbToHex(+this.props.chart.styles[item.id].strokeColor.r, +this.props.chart.styles[item.id].strokeColor.g, +this.props.chart.styles[item.id].strokeColor.b))
          .style('stroke', rgbToHex(+this.props.chart.styles[item.id].strokeColor.r, +this.props.chart.styles[item.id].strokeColor.g, +this.props.chart.styles[item.id].strokeColor.b));
    
      nextX += 10;
      legend
        .append('text')
          .attr('class', item.id + '-legend-item')
          .attr('x', nextX)
          .attr('y', 7)
          .attr('dy', '.15em')
          .style('text-anchor', 'start')
          .style('font', '14px sans-serif')
          .style('font-weight', 'normal')
          .on('click', () => {
            //const active = linechart.active ? false : true;
            //const newOpacity = active ? 0 : 1;
            //d3.selectAll(el).style('opacity', newOpacity);
            //linechart.active = active;
          })
          .text(item.name);

      let bbox = d3.select('.' + item.id + '-legend-item').node().getBBox();
      nextX += bbox.width + 15;
    });
  }

  drawChart() {
    const margin = { top: 25, right: 55, bottom: 100, left: 75 };
    if (this.props.chart.settings.enableZoomControl) {
      margin.bottom = 150;
    }

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
          const el = document.getElementById(`${k}-chart`);
          while (el.firstChild) {
            el.removeChild(el.firstChild);
          }

          const width = el.clientWidth - margin.left - margin.right;
          let height = 450 - margin.top - margin.bottom;
          if (this.props.chart.settings.enableZoomControl) {
            height = 500 - margin.top - margin.bottom;
          }
    
          const svg = d3.select(el)
            .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

          const minDate = new Date(d3.min(this.props.data[k].map(d => { return d.dateHour; })));
          const maxDate = new Date(d3.max(this.props.data[k].map(d => { return d.dateHour; })));
          const x = d3.time.scale()
            .domain([
              minDate,
              maxDate
            ])
            .range([0, width]);
          
          const minValue = d3.min(this.props.data[k].map(d => { return _.min([d.est, d.up, d.low, d.measurement]); }));
          const maxValue = d3.max(this.props.data[k].map(d => { return _.max([d.est, d.up, d.low, d.measurement]); }));
          const y = d3.scale.linear().range([height, 0])
            .domain([
              minValue,
              maxValue
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

          function transitionData() {
            primary.select('.line')
              .transition()
                .duration(500)
                .attr('d', line);

            primary.select('.line-upper')
              .transition()
                .duration(500)
                .attr('d', inferredBounds[0]);

            primary.select('.line-lower')
              .transition()
                .duration(500)
                .attr('d', inferredBounds[1]);

            primary.selectAll('.dot')
              .data(this.props.data[k])
            .transition()
              .duration(500)
              .attr('cx', (d) => { return x(new Date(d.dateHour)); });
          }

          function resetAxis() {
            primary.transition().duration(500)
             .select('.x.axis')
             .call(xAxis);
          }

          const xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickFormat(d3.time.format(timeFormat)); // @TODO -- Multi Time Formats

          const yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

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
                .attr('x', '0')
                .attr('y', '0')
                .attr('width', width)
                .attr('height', height);

          const primary = svg
            .append('g')
              .attr('class', 'primary')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

          const xRef = x;
          const yRef = y;
          const dataRef = this.props.data[k];
          const bisectDate = d3.bisector((d) => { return d.dateHour; }).left;
              
          const graph =
            primary.append('g')
              .attr('clip-path', 'url(#clip)');

          primary.append('text')
            .attr('x', (width / 2))
            .attr('y', 0 - (margin.top / 2))
            .attr('text-anchor', 'middle')  
            .style('font-size', '16px') 
            .style('text-decoration', 'underline')  
            .text(datasetMap[k]);

          if (this.props.chart.settings.showUncertainityBand) {
            const inferredBandStyles = this.props.chart.styles.inferredBand;
            graph.append('path')
              .datum(this.props.data[k])
                .attr('class', 'area')
                .attr('d', inferredBand)
                .style('z-index', 50)
                .style('fill', rgbToHex(+inferredBandStyles.fillColor.r, +inferredBandStyles.fillColor.g, +inferredBandStyles.fillColor.b))
                .style('fill-opacity', +inferredBandStyles.fillColor.a);
          }

          graph.append('path')
            .datum(this.props.data[k])
              .attr('class', 'line')
              .attr('d', line)
              .style('z-index', 100)
              .style('fill', 'none')
              .style('stroke', rgbToHex(+inferred.strokeColor.r, +inferred.strokeColor.g, +inferred.strokeColor.b))
              .style('stroke-width', inferred.strokeWidth + 'px')
              .style('stroke-dasharray', inferred.dashArray)
              .style('stroke-opacity', +inferred.strokeColor.a);

          if (this.props.chart.settings.showUncertainityBounds) {
            const inferredUpperBound = this.props.chart.styles.inferredUpperBound;
            graph.append('path')
              .datum(this.props.data[k])
                .attr('class', 'line-upper')
                .attr('d', inferredBounds[0])
                .style('z-index', 99)
                .style('fill', 'none')
                .style('stroke', rgbToHex(+inferredUpperBound.strokeColor.r, +inferredUpperBound.strokeColor.g, +inferredUpperBound.strokeColor.b))
                .style('stroke-width', inferredUpperBound.strokeWidth + 'px')
                .style('stroke-dasharray', inferredUpperBound.dashArray)
                .style('stroke-opacity', +inferredUpperBound.strokeColor.a);

            const inferredLowerBound = this.props.chart.styles.inferredLowerBound;
            graph.append('path')
              .datum(this.props.data[k])
                .attr('class', 'line-lower')
                .attr('d', inferredBounds[1])
                .style('z-index', 99)
                .style('fill', 'none')
                .style('stroke', rgbToHex(+inferredLowerBound.strokeColor.r, +inferredLowerBound.strokeColor.g, +inferredLowerBound.strokeColor.b))
                .style('stroke-width', inferredLowerBound.strokeWidth + 'px')
                .style('stroke-dasharray', inferredLowerBound.dashArray)
                .style('stroke-opacity', +inferredLowerBound.strokeColor.a);
          }

          // highlight the data points
          graph.selectAll('.dot')
            .data(this.props.data[k])
          .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', line.x())
            .attr('cy', line.y())
            .attr('r', 4)
            .style('fill', 'white')
            .style('stroke', rgbToHex(+inferred.strokeColor.r, +inferred.strokeColor.g, +inferred.strokeColor.b))
            .style('stroke-width', inferred.strokeWidth + 'px')
            .style('stroke-opacity', +inferred.strokeColor.a);

          if (this.props.chart.settings.enableDataPointInteraction && k !== 'q') {
            const filtersRefInner = this.props.chart.filters;
            primary
              .on('contextmenu', function () { // should be for dots only
                const mouse = d3.mouse(this);
                const mouseDate = xRef.invert(mouse[0]);
                const i = bisectDate(dataRef, mouseDate); // not sure the this instance is valid here

                // verify the y coordinate matches the estimate
                const d0 = dataRef[i - 1]
                const d1 = dataRef[i];
                // work out which date value is closest to the mouse
                const d = mouseDate - d0.dateHour > d1.dateHour - mouseDate ? d1 : d0;

                const x = xRef(d.dateHour);
                const y = yRef(yRef.invert(mouse[1]));

                if (!(y >= yRef(d.est) - 5 && y <= yRef(d.est) + 5)) {
                  return;
                }

                const dateHourRef = d.dateHour;
                const maxum = d.est;
                d3.select('#' + k + '-menu').html('');
                const list = d3.selectAll('#' + k + '-menu').append('ul');
                list.selectAll('li').data([{
                    title: 'View Model'
                  }])
                  .enter()
                  .append('li')
                  .html(function(d) {
                    return '<a href="#modelModal" style="color: inherit;text-decoration: none;">' + d.title + '</a>';
                  })
                  .on('click', function(d, i) {
                    document.getElementById('uncertanityModelDetails').innerHTML = 
                      '<div>Well: <strong>' + filtersRefInner.well + '</strong></div>' +
                      '<div>Opdataset: <strong>' + datasetMap[k] + '</strong></div>' +
                      '<div id="model-chart"></div>';

                    // now fetch the data and draw the chart
                    let startDate;
                    let endDate;
                    let midpoints;
                    if (filtersRefInner.grouping === 'hourly') {
                      startDate = moment(dateHourRef).startOf('hour');
                      endDate = moment(dateHourRef).endOf('hour');
                      midpoints = 60 / 2;
                    }
                    else if (filtersRefInner.grouping === 'daily') {
                      startDate = moment(dateHourRef).startOf('day');
                      endDate = moment(dateHourRef).endOf('day');
                      midpoints = (24 * 60) / 2;
                    }
                    else if (filtersRefInner.grouping === 'weekly') {
                      startDate = moment(dateHourRef).startOf('week');
                      endDate = moment(dateHourRef).endOf('week');
                      midpoints = (7 * 24 * 60) / 2;
                    }
                    else if (filtersRefInner.grouping === 'monthly') {
                      startDate = moment(dateHourRef).startOf('month');
                      endDate = moment(dateHourRef).endOf('month');
                      midpoints = (30 * 7 * 24 * 60) / 2;
                    }

                    agent.post('http://ec2-54-191-118-209.us-west-2.compute.amazonaws.com:5001/api/v1/model')
                      .send({ well: filtersRefInner.well, sensor: k, startDate: startDate.valueOf(), endDate: endDate.valueOf() })
                      .set('Accept', 'application/json')
                      .end((err, response) => {
                        if (err) {
                          return reject(err);
                        }

                        // draw our chart
                        const cel = document.getElementById('model-chart');
                        while (cel.firstChild) {
                          cel.removeChild(cel.firstChild);
                        }

                        const marginModel = {top: 20, right: 20, bottom: 30, left: 65};
                        const widthModel = 500 - marginModel.left - marginModel.right;
                        const heightModel = 450 - marginModel.top - marginModel.bottom;

                        const minDateModel = new Date(startDate.valueOf());
                        const maxDateModel = new Date(endDate.valueOf());
                        const xModel = d3.time.scale()
                          .domain([
                            minDateModel,
                            maxDateModel
                          ])
                          .range([0, widthModel]);

                        const yModel = d3.scale.linear()
                          .range([heightModel, 0]);

                        const xAxisModel = d3.svg.axis()
                          .scale(xModel)
                          .orient('bottom');

                        const yAxisModel = d3.svg.axis()
                          .scale(yModel)
                          .orient('left');

                        const curveModel = d3.svg.line()
                          .interpolate('cardinal')
                          .x(d => {
                            return xModel(new Date(d.dateHour));
                          })
                          .y(d => {
                            return yModel(d.value);
                          });

                        const svgModel = d3.select('#model-chart').append('svg')
                            .attr('width', widthModel + marginModel.left + marginModel.right)
                            .attr('height', heightModel + marginModel.top + marginModel.bottom)
                          .append('g')
                            .attr('transform', 'translate(' + marginModel.left + ',' + marginModel.top + ')');

                        const dataset = response.body;

                        const clipModel = svgModel
                          .append('svg:clipPath')
                            .attr('id', 'clipModel')
                            .append('svg:rect')
                              .attr('id', 'clip-rect')
                              .attr('x', '0')
                              .attr('y', '0')
                              .attr('width', widthModel)
                              .attr('height', heightModel);

                        const brush = d3.svg.brush()
                          .x(xModel)
                          .y(yModel)
                          .on('brushend', brushended);

                        xModel.domain(d3.extent(dataset, function(d) { return new Date(d.dateHour); })).nice();
                        yModel.domain(d3.extent(dataset, function(d) { return d.measurement; })).nice();

                        const graphModel =
                          svgModel.append('g')
                            .attr('clip-path', 'url(#clipModel)');
                        
                        svgModel.append('g')
                          .attr('class', 'axis--x')
                          .attr('transform', 'translate(0,' + heightModel + ')')
                          .call(xAxisModel);

                        svgModel.append('g')
                          .attr('class', 'axis--y')
                          .call(yAxisModel);

                        graphModel.selectAll('.model-measure')
                          .data(dataset)
                        .enter().append('circle')
                          .attr('class', 'model-measure')
                          .attr('r', 3.5)
                          .attr('cx', function(d) { return xModel(new Date(d.dateHour)); })
                          .attr('cy', function(d) { return yModel(d.measurement); })
                          .attr('fill', '#1f77b4')
                          .attr('fill-opacity', function(d) { return d.uncertainity / 100; })
                          .attr('stroke', '#000')
                          .attr('stroke-opacity', 0.2);

                        const randomMidpoint = Math.floor(Math.random() * (midpoints - (midpoints / 2))) + (midpoints - (midpoints / 2));
                        graphModel.append('path')
                          .datum([
                              { dateHour: xModel.domain()[0].getTime(), value: yModel.domain()[0] },
                              { dateHour: dateHourRef, value: maxum },
                              { dateHour: xModel.domain()[1].getTime(), value: yModel.domain()[0] }
                            ])
                          .attr('class', 'model-curve')
                          .attr('d', curveModel)
                          .style('fill', 'none')
                          .style('stroke', '#000000')
                          .style('stroke-width', 2.5)
                          .style('stroke-dasharray', '5 5')
                          .style('stroke-opacity', 0.8);

                        graphModel.selectAll('.maxum')
                          .data([
                              { dateHour: dateHourRef, value: maxum }
                            ])
                        .enter().append('circle')
                          .attr('class', 'maxum')
                          .attr('r', 9.5)
                          .attr('cx', function(d) { return xModel(new Date(d.dateHour)); })
                          .attr('cy', function(d) { return yModel(d.value); })
                          .attr('fill', '#edf8b1')
                          .attr('fill-opacity', 0.3)
                          .attr('stroke', '#000')
                          .attr('stroke-opacity', 0.2);

                        graphModel.append('g')
                          .attr('class', 'brush')
                          .call(brush);

                        function brushended() {
                          if (brush.empty()) {
                            xModel.domain(d3.extent(dataset, function(d) { return new Date(d.dateHour); })).nice();
                            yModel.domain(d3.extent(dataset, function(d) { return d.measurement; })).nice();
                          }
                          else {
                            const ext = brush.extent();
                            xModel.domain([ext[0][0], ext[1][0]]);
                            yModel.domain([ext[0][1], ext[1][1]]);
                            graphModel.select('.brush').call(brush.clear());
                          }
                          zoom();
                        }

                        function zoom() {
                          d3.select('.axis--x').call(xAxisModel);
                          d3.select('.axis--y').call(yAxisModel);
                          d3.selectAll('.model-measure')
                            .attr('cx', function(d) { return xModel(new Date(d.dateHour)); })
                            .attr('cy', function(d) { return yModel(d.measurement); });
                          d3.select('.model-curve')
                            .attr('d', curveModel);
                          d3.selectAll('.maxum')
                            .attr('cx', function(d) { return xModel(new Date(d.dateHour)); })
                            .attr('cy', function(d) { return yModel(d.value); });
                        }
                      });

                    d3.select('#' + k + '-menu').style('display', 'none');
                  });

                const m = d3.select('#' + k + '-menu');
                m
                  .style('left', (x + 120) + 'px') // note this is not responsive, should account for sidebar being visible
                  .style('top', (y + 100) + 'px') // note this is not responsive, should account for header being visible
                  .style('display', 'block');

                d3.select('body').on('click', () => { m.style('display', 'none'); d3.select('body').on('click', null); });

                d3.event.preventDefault();
              });
          }

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

          if (this.props.chart.settings.enableZoomControl) {
            const xMini = d3.time.scale()
              .domain([
                minDate,
                maxDate
              ])
              .range([0, width]);

            const yMini = d3.scale.linear().range([35, 0])
              .domain([
                minValue,
                maxValue
              ]);

            const yMiniAxis = d3.svg.axis()
              .scale(yMini)
              .ticks(3)
              .orient('left');

            let zoomControl =
              primary.append('g')
                .attr('class', 'zoom')
                .attr('transform', (d, i) => { return 'translate(0,' + 385 + ')'; });

            zoomControl
              .append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,35)')
                .call(xAxis)
                .selectAll('text')
                  .attr('transform', function(d) {
                    return 'translate(' + this.getBBox().height*-1 + ',' + this.getBBox().height + ')rotate(-45)';
                  });

            zoomControl
              .append('g')
                .attr('class', 'y axis')
                .call(yMiniAxis);

            const brush = d3.svg.brush()
              .x(xMini)
              .on('brush', brushed);

            zoomControl.append('g')
              .attr('class', 'x brush')
              .call(brush)
            .selectAll('rect')
              .attr('y', -6)
              .attr('height', 35 + 7);

            const resetBtn = document.getElementById(`${k}-reset-btn`);
            const settingsRef = this.props.chart.settings;
            function brushed() {
              resetBtn.style.display = 'block';

              x.domain(brush.empty() ? xMini.domain() : brush.extent());
              primary.select('.line').attr('d', line);
              primary.selectAll('.dot').attr('cx', line.x()).attr('cy', line.y());
              primary.selectAll('.measurement').attr('cx', d => { return x(new Date(d.dateHour)); });
              if (settingsRef.showUncertainityBounds) {
                primary.select('.line-upper').attr('d', inferredBounds[0]);
                primary.select('.line-lower').attr('d', inferredBounds[1]);
              }

              if (settingsRef.showUncertainityBand) {
                primary.select('.area').attr('d', inferredBand);
              }
              primary.select('.x.axis').call(xAxis);

              function processReset() {
                x.domain([minDate, maxDate]);

                d3.selectAll('.brush').call(brush.clear());
                
                resetBtn.removeEventListener('click', processReset);
                resetBtn.style.display = 'none';
              }

              resetBtn.addEventListener('click', processReset);
            }
          }

          // Axis Titles
          const padding = (k === 'whp' || k === 'bhp' || k === 'rp') ? 65 : 55;
          primary.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(' + (padding * -1) + ',' + (height / 2) + ')rotate(-90)')
            .text(k === 'whp' || k === 'bhp' || k === 'rp' ? 'Pressure (PSI)' : k === 'q' ? 'Flow Rate (Mcf)' : 'Temperature (Kelvin)');

          if (this.props.chart.settings.showEdgeCoordinates) {
            const focus = primary.append('g').style('display', 'none');
            focus.append('line')
              .attr('id', 'focusLineX')
              .attr('class', 'focusLine');
            focus.append('line')
              .attr('id', 'focusLineY')
              .attr('class', 'focusLine');
            focus.append('rect')
              .attr('id', 'focusXCoordinate')
              .attr('class', 'focusCoordinate')
              .attr('height', 20)
              .attr('width', 130)
              .attr('fill', '#B8B8B8')
              .attr('fill-opacity', 0.85)
              .attr('stroke', '#5C5C5C')
              .attr('stroke-width', 1.3);
            focus.append('text')
              .attr('id', 'focusXCoordinateText')
              .attr('class', 'focusCoordinateText')
              .attr('fill', '#000000');
            focus.append('rect')
              .attr('id', 'focusYCoordinate')
              .attr('class', 'focusCoordinate')
              .attr('height', 20)
              .attr('width', 50)
              .attr('fill', '#B8B8B8')
              .attr('fill-opacity', 0.85)
              .attr('stroke', '#5C5C5C')
              .attr('stroke-width', 1.3);
            focus.append('text')
              .attr('id', 'focusYCoordinateText')
              .attr('class', 'focusCoordinateText')
              .attr('fill', '#000000');

            const enableTooltips = this.props.chart.settings.enableTooltips;
            primary.append('rect')
              .attr('class', 'overlay') // add to css
              .attr('width', width)
              .attr('height', height)
              .on('mouseover', () => { focus.style('display', null); })
              .on('mouseout', () => {
                focus.style('display', 'none');
                d3.select('#' + k + '-tooltip')
                  .html('');
              })
              .on('mousemove', function() { 
                const mouse = d3.mouse(this);
                const mouseDate = xRef.invert(mouse[0]);
                const i = bisectDate(dataRef, mouseDate); // not sure the this instance is valid here
                
                const d0 = dataRef[i - 1]
                const d1 = dataRef[i];
                // work out which date value is closest to the mouse
                const d = mouseDate - d0.dateHour > d1.dateHour - mouseDate ? d1 : d0;

                const x = xRef(d.dateHour);
                const y = yRef(yRef.invert(mouse[1]));

                focus.select('#focusLineX')
                  .attr('x1', x).attr('y1', yRef(minValue))
                  .attr('x2', x).attr('y2', yRef(maxValue));
                focus.select('#focusLineY')
                  .attr('x1', xRef(minDate)).attr('y1', y)
                  .attr('x2', xRef(maxDate)).attr('y2', y);
                focus.select('#focusXCoordinate')
                  .attr('x', x - 65)
                  .attr('y', yRef(minValue) + 2);
                focus.select('#focusXCoordinateText')
                  .attr('x', x - 60)
                  .attr('y', yRef(minValue) + 17)
                  .text(moment(d.dateHour).format('MMM D, YYYY HH:00'));
                focus.select('#focusYCoordinate')
                  .attr('x', -50)
                  .attr('y', y - 10);
                focus.select('#focusYCoordinateText')
                  .attr('x', -45)
                  .attr('y', y + 5)
                  .text(yRef.invert(mouse[1]).toFixed(0));

                if (enableTooltips) {
                  let tooltip = 'Date: <strong>' + moment(d.dateHour).format('MMM D, YYYY HH:00') + '</strong>, Inferred: <strong>' + d.est.toFixed(2) + '</strong>, Inferred Upper Bound: <strong>' + d.up.toFixed(2) + '</strong>, Inferred Lower Bound: <strong>' + d.low.toFixed(2) + '</strong>';
                  if (d.measurement) {
                    tooltip += ', Measurement: <strong>' + d.measurement.toFixed(2) + '</strong>';
                    const offset = (d.est - d.measurement);
                    tooltip += ', Measurement Offset: <strong>' + (offset < 0 ? offset * -1 : offset).toFixed(2) + '</strong>';
                  }
                  // now show the tooltip as text at the top of the graph
                  d3.select('#' + k + '-tooltip')
                    .style('width', width + 'px')
                    .html(tooltip);
                }
              });
          }

          if (k !== 'q') {
            this.drawMeasurements(k, graph, x, y);
          }

          if (this.props.chart.settings.showLegend) {
            this.drawLegend(k, primary);
          }
        }
      });
    }
  }

  render() {
    let charts;
    if (!this.props.chart.settings.stackCharts) {
      const set = Object.keys(this.props.chart.opdatasets).map(k => {
        if (this.props.chart.opdatasets[k]) {
          return (<div key={`${k}-chart`} className="col-xs-12 col-sm-6">
              <a href="#" className="btn btn-default btn-xs" style={{left: '116px', top: '22px', position: 'absolute'}}>
                <i className="fa fa-expand"></i>
              </a>
              <a href="#" id={k + '-reset-btn'} className="btn btn-default btn-xs" style={{left: '170px', top: '22px', position: 'absolute', display: 'none'}}>
                <i className="fa fa-search-minus"></i>
              </a>
              <div id={`${k}-tooltip`} style={{left: '116px', top: '44px', fontSize: '11px', position: 'absolute', wordWrap: 'break-word'}}></div>
              <div id={`${k}-menu`} className='d3-context-menu' style={{display: 'none'}}></div>
              <div id={`${k}-chart`} style={{margin: '73px 25px 25px 25px', textAlign: 'center'}}>
                <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
              </div>
            </div>);
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
        <div id="modelModal" className="modalDialog">
          <div>
            <a href="#close" title="Close" className="close">X</a>
            <h3 style={{textDecoration: 'underline', marginTop: '5px'}}>Uncertainty Model</h3>
            <div id="uncertanityModelDetails">
            </div>
          </div>
        </div>
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