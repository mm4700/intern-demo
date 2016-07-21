import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import * as d3 from 'd3';

const parseDate = d3.time.format('%e/%-m/%Y %H');

export default class HomeView extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      data: []
    };
  }

  componentWillMount() {
    Object.keys(this.props.chart.opdatasets).map(k => {
      if (this.props.chart.opdatasets[k]) {
        this.props.actions.fetchData(k, this.props.chart);
      }
    });
  }

  componentDidMount() {
    //this.drawChart();
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
        .on('mouseout', d => {
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

  drawEventTimeline() {
    // https://fbe94b5b83362330a8429bb16098a3285147bcbf.googledrive.com/host/0Bz6WHrWac3FrZUtuOExWdlRGVG8//proximitynetwork.html
  }

  drawSensorPlot() {
    // http://phatduino.com.w010a51b.kasserver.com/visavail/example.htm
  }

  drawEdgeCoordinates() {
    // TODO
  }

  drawZoomPan() {
    // TODO
  }

  drawUncertainity() {
    // as bounds or banding
  }

  applyFilters() {
    // TODO
  }

  drawRadialMenu() {
    // Options
    //  Remove
    //  Info, Model (shows the distrubution curve), Filter, Report
  }

  drawChart() {
    const margin = { top: 10, right: 55, bottom: 100, left: 40 };

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
      charts = Object.keys(this.props.chart.opdatasets).map(k => {
        if (this.props.chart.opdatasets[k]) {
          const el = document.getElementById(`${k}-chart`);
          const width = el.clientWidth - margin.left - margin.right;
          const height = el.clientHeight - margin.top - margin.bottom;
    
          const svg = d3.select(el)
            .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

          const minDate = new Date(moment(this.props.chart.filters.startDate, 'MM/DD/YYYY HH:mm').valueOf());
          const maxDate = new Date(moment(this.props.chart.filters.endDate, 'MM/DD/YYYY HH:mm').valueOf());
          const x = d3.time.scale()
            .domain([minDate, maxDate])
            .range([0, width]);
          
          const y = d3.scale.linear().range([height, 0])
            .domain([10, d3.max(mydata.data1.map(d => { return d.upPressure1; }))]); // TODO

          const xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickFormat(d3.time.format('%e/%-m %H')); // @TODO -- Multi Time Formats

          const yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

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
        }
      });
    }
    
    //drawMeasurements(el);
    // TODO -- only show if user selected it, need to customize the look n feel
    //drawLegend(el);
  }

  render() {
    console.log('props', this.props);

    let charts;
    if (!this.props.chart.settings.stackCharts) {
      charts = Object.keys(this.props.chart.opdatasets).map(k => {
        if (this.props.chart.opdatasets[k]) {
          return <div id={`${k}-chart`}></div>;
        }
      });
    }
    else {
      charts = <div id="chart-container"></div>;
    }

    return (
      <div id="content" className="content">
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

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);