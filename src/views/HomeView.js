import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import d3 from 'd3';
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

    let sensorMeasurement = this.props.chart.styles.measurement;
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
        .attr('cy', yMap);
  }

  drawLegend(k, primary) {
    let legend =
      primary.append('g')
          .attr('class', 'legend')
          .attr('transform', (d, i) => { return 'translate(0,' + 385 + ')'; });

    const legendItems = [
      { id: 'inferred', name: 'Inferred' },
      { id: 'inferredUpperBound', name: 'Inferred Upper Bound' },
      { id: 'inferredLowerBound', name: 'Inferred Lower Bound' },
      { id: 'measurement', name: 'Measurement' }
    ];
    
    let nextX = 0;
    _.each(legendItems, (item, i) => {
      legend
        .append('rect')
          .attr('x', nextX)
          .attr('width', 25)
          .attr('height', 10)
          .style('fill', 'white')
          .style('stroke', rgbToHex(+this.props.chart.styles[item.id].strokeColor.r, +this.props.chart.styles[item.id].strokeColor.g, +this.props.chart.styles[item.id].strokeColor.b));
    
      nextX += 30;
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
      nextX += bbox.width + 5;
    });
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

          function zoomed() {
            graph.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
          }

          const zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on('zoom', function() {
              zoomed();
            });

          const resetBtn = document.getElementById(`${k}-reset-btn`);
          function brushend() {
            resetBtn.style.display = 'block';

            x.domain(brush.extent());

            transitionData.call(this);
            resetAxis();

            d3.select('.brush').call(brush.clear()); // not clearing all brushes

            function processReset() {
              x.domain([minDate, maxDate]);
              transitionData.call(this);
              resetAxis();
              resetBtn.removeEventListener('click', processReset);
              resetBtn.style.display = 'none';
            }

            resetBtn.addEventListener('click', processReset.bind(this));
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

          const brush = d3.svg.brush()
            .x(x)
            .on('brushend', brushend.bind(this));

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
                .attr('x', '0')
                .attr('y', '0')
                .attr('width', width )
                .attr('height', height);

          const primary = svg
            .append('g')
              .attr('class', 'primary')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
              .call(zoom);
              
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
            .attr('r', 10)
            .style('fill', 'white')
            .style('stroke', rgbToHex(+inferred.strokeColor.r, +inferred.strokeColor.g, +inferred.strokeColor.b))
            .style('stroke-width', inferred.strokeWidth + 'px')
            .style('stroke-opacity', +inferred.strokeColor.a)
            .on('contextmenu', function (d,i) {
              

              //d3.event.preventDefault();
            });

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
              .attr('class', 'focusCoordinate');
            focus.append('rect')
              .attr('id', 'focusYCoordinate')
              .attr('class', 'focusCoordinate');

            const xRef = x;
            const yRef = y;
            const dataRef = this.props.data[k];
            const bisectDate = d3.bisector((d) => { return d.dateHour; }).left;
            primary.append('rect')
              .attr('class', 'overlay') // add to css
              .attr('width', width)
              .attr('height', height)
              .on('mouseover', () => { focus.style('display', null); })
              .on('mouseout', () => { focus.style('display', 'none'); })
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
                //focus.selexct('#focusXCoordinate')
                //  .attr('x1', xRef(minDate)).attr('y1', y)
                //  .attr('x2', xRef(maxDate)).attr('y2', y);
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

          // Axis Titles
          const padding = (k === 'whp' || k === 'bhp' || k === 'rp') ? 65 : 55;
          primary.append('text')
            .attr('text-anchor', 'middle') 
            .attr('transform', 'translate(' + (padding * -1) + ',' + (height / 2) + ')rotate(-90)')
            .text(k === 'whp' || k === 'bhp' || k === 'rp' ? 'Pressure (PSI)' : k === 'q' ? 'Flow Rate (Mcf)' : 'Temperature (Kelvin)');

          graph.append('g')
            .attr('class', 'x brush')
            .call(brush)
          .selectAll('rect')
            .attr('y', -6)
            .attr('height', height + 7);

          if (k !== 'q') {
            this.drawMeasurements(k, graph, x, y);
          }

          if (this.props.chart.settings.showLegend) {
            console.log('drawing legend');
            this.drawLegend(k, primary);
          }
        }
      });
    }
  }

  render() {
    console.log('render');

    let charts;
    if (!this.props.chart.settings.stackCharts) {
      const set = Object.keys(this.props.chart.opdatasets).map(k => {
        if (this.props.chart.opdatasets[k]) {
          return <div className="col-xs-12 col-sm-6"><a href="#" className="btn btn-default btn-xs" style={{left: '116px', top: '22px', position: 'absolute'}}><i className="fa fa-expand"></i></a><a href="#"  id={k + '-reset-btn'} className="btn btn-default btn-xs" style={{left: '170px', top: '22px', position: 'absolute', display: 'none'}}><i className="fa fa-search-minus"></i></a><div key={`${k}-chart`} id={`${k}-chart`} style={{margin: '25px'}}></div></div>;
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