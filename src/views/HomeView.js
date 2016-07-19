import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import * as d3 from 'd3';

const parseDate = d3.time.format('%e/%-m/%Y %H');

export default class HomeView extends Component {
  constructor(props, context) {
    super(props, context)
  }

  componentWillMount() {
    this.props.actions.fetchUncertainityData();
    this.props.actions.fetchMeasurementsData();
    this.props.actions.fetchRatesData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.uncertainityData) {
      this.sanitizeData('uncertainityData', nextProps.uncertainityData);
    }

    if (nextProps.measurementsData) {
      this.sanitizeData('measurementsData', nextProps.measurementsData);
    }

    if (nextProps.ratesData) {
      this.sanitizeData('ratesData', nextProps.ratesData);
    }
  }

  sanitizeData(dataset, m) { 
    m.forEach(d => {
      Object.keys(d).forEach(k => {
        if (k === 'dateHour') {
          d.date = parseDate.parse(d.dateHour);
        }
        else {
          d[k] = +d[k];
        }
      });
    });

    m.minDate = m[0].date;
    m.maxDate = m[m.length - 1].date;

    const datasetState = {};
    datasetState[dataset] = m;
    this.setState(datasetState);
  }

  drawMeasurements() {
    const xMap = d => { return x(d.date); };
    const yMap = d => { return y(d.est); };
    const yMap1 = d => { return y(d.est1); };

    this.primary
      .selectAll('.chart')
      .data(mydata.data2)
      .enter()
      .append('circle')
        .attr('class', 'dot')
        .attr('clip-path', 'url(#clip)')
        .style('fill', '#bc90ba')
        .attr('r', 2.8)
        .attr('cx', xMap)
        .attr('cy', yMap)
        .on('mouseover', d => {
          tooltip.transition()
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

          tooltip.html('<h1>' + 'X: ' + d.dateHour + ' Y: ' + d.est.toFixed(2) + ' uncertainty:' + dist.toFixed(3) + '</h1>');
        })
        .on("mouseout", d => {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
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

  drawChart() {
    const el = document.getElementById('content');

    // change based on whether legend is shown? whethever event timeline is shown?
    const margin = { top: 10, right: 55, bottom: 100, left: 40 };
    const width = document.getElementById('content').clientWidth - margin.left - margin.right;
    const height = (document.getElementById('content').clientHeight - 100) - margin.top - margin.bottom;
    
    const svg = d3.select(el)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const headingsArray = [];
    Object.keys(this.props.chart.opdatasets).forEach(k => {
      if (this.props.chart.opdatasets[k]) {
        headingsArray = headingsArray.concat(Object.keys(this.state[k + 'Data'][0]).filter(d => d !== 'date'));
      }
    });

    const colorsArray = ['#E2C6DA', '#9FA47B', '#BABC94', '#CBCB47', '#ECF370', '#EADD2C', '#92CD00'];

    const x = d3.time.scale()
      .domain([mydata.minDate, mydata.maxDate]) // TODO
      .range([0, width]);
    
    const y = d3.scale.linear().range([height, 0])
      .domain([10, d3.max(mydata.data1.map(d => { return d.upPressure1; }))]); // TODO

    const y1 = d3.scale.linear().range([height, 0])
      .domain([500, d3.max(mydata.data3.map(d => { return d.rate; }))]); // TODO

    const xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickFormat(d3.time.format('%e/%-m %H')); // @TODO -- Multi Time Formats

    const yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    const yAxis1 = d3.svg.axis()
      .scale(y1)
      .orient('right');

    const tooltip = d3.select(el)
      .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    const line = d3.svg.line()
      .interpolate('basis')
      .x(d => {
        return x(d.date);
      })
      .y(d => {
        return y(d.pressureValue);
      });

    const line2 = d3.svg.line()
      .interpolate('basis')
      .x(d => {
        return x(d.date);
      })
      .y(d => {
        return y1(d.rateValue);
      });

    const color = d3.scale.ordinal()
      .domain(headingsArray)
      .range(colorsArray);

    color.domain(d3.keys(m).filter(key => {
      return key !== 'dateHour';
    })); 

    var chart1data = headingsArray.map(function(item) {
      return {
        name: item,
        values: mydata.data1.map(function(d) {
          return {date: d.date, pressureValue: +d[item]};
        })
      };
    });

    var rateData = headingsArray.map(function(item) {
      return {
        name: item,
        values: mydata.data3.map(function(d) {
          return {date: d.date, rateValue: +d.rate};
        })
      };
    });  

    const clip = svg
      .append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
          .attr('id', 'clip-rect')
          .attr('x', '0')
          .attr('y', '0')
          .attr('width', width)
          .attr('height', height);

    const rect = svg
      .append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white');

    const primary = svg
      .append('g')
        .attr('class', 'primary')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    primary.selectAll('.chart')
        .data(chart1data)
        .enter()
        .append('path')
          .attr('class', 'line')
          .attr('clip-path', 'url(#clip)')
          .attr('id', 'linechart')
          .attr('d', (d) => { return line(d.values); })
          .style('stroke', (d) => { return color(d.name); });

    primary.selectAll('.chart')
        .data(rateData)
        .enter()
        .append('path')
          .attr('class', 'line2')
          .attr('id', 'linechart')
          .attr('d', (d) => { return line2(d.values); })
          .style('stroke', (d) => { return color(d.name); });

    primary
      .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    primary
      .append('text')
        .attr('x', 920)
        .attr('y', 410)// text label for the x axis
        .style('text-anchor', 'end')
        .text('Time');

    svg.append('defs')
      .append('clipPath')
        .attr('id', 'clip')
      .append('rect')
        .attr('width', width)
        .attr('height', height);  

    primary
      .append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('pressure');

    primary
      .append('g')
        .attr('class', 'y axis1')
        .call(yAxis1)
        .attr('transform', 'translate(' + width + ',0)')   
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('rate');

        

    drawMeasurements(el);
    drawLegend(el);
  }

  render() {
    console.log('this.props', this.props);

    return (
      <div id="content" className="content"></div>
    );
  }
}

const mapStateToProps = (state) => ({
  uncertainityData: state.uncertainity.data,
  measurementsData: state.measurements.data,
  rateData: state.rates.data,
  chart: state.chart.configuration,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);