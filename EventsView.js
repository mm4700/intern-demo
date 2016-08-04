import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

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
      if (nextProps.chart.filters.well !== this.state.previous.well
        || nextProps.chart.filters.startDate !== this.state.previous.startDate
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
    const height = 550 - margin.top - margin.bottom;

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

    const colors = {
      'Well Offline': { color: '#DCEDC2', id: 'welloffline' },
      'Wellhead Maintenance': { color: '#ade3d1', id: 'wellheadmaintenance' },
      'Slickline': { color: '#095dd3', id: 'slickline' },
      'Braided Line': { color: '#FFAAA6', id: 'braidedline' },
      'Snubbing': { color: '#e8e67b', id: 'snubbing' },
      'Workover': { color: '#f7c9d2', id: 'workover' }
    };

    let breakdown = {
      name: 'Offline',
      children: [
        { name: 'Well Offline', size: 0, },
        { name: 'Wellhead Maintenance', size: 0 },
        { name: 'Slickline', size: 0 },
        { name: 'Braided Line', size: 0 },
        { name: 'Snubbing', size: 0 },
        { name: 'Workover', size: 0 }
      ]
    }

    // draw the actual events
    const dataRef = this.props.events;
    const div = d3.select('.evtooltip');
    let totalTime = 0;
    let longest = -1;
    dataRef.forEach((data, n) => {
      if (n !== dataRef.length - 1) {
        totalTime += data.duration;

        breakdown.children.forEach((t) => {
          if (data.duration > longest) {
            longest = data.duration;
          }

          if (t.name === data.event) {
            t.size += data.duration;
            if (!t.children) {
              t.children = [];
            }

            t.children.push({ name: moment(data.dateHour).format('dddd, MMMM Do YYYY, hh:mm'), size: data.duration });
          }
        });

        const xval = x(new Date(data.dateHour));
        const yval = y(50);
        const w = x(moment(data.dateHour).add(data.duration, 'minutes').valueOf()) - xval;
        svg.append('rect')
          .attr('class', 'bar')
          .attr('x', xval)
          .attr('y', y(100))
          .attr('width', w)
          .attr('height', y(0))
          .attr('fill', colors[data.event].color )
          .attr('fill-opacity', 0.5)
          .attr('stroke', '#000000')
          .attr('stroke-linecap', 'butt')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-opacity', 0.5)
          // add hover
          .on('mouseover', function(d, i) {
            div
              .transition()
              .duration(200)
              .style('opacity', .9);
            div
              .html('Event: <strong>' + data.event + '</strong><br/>Occurred:<br/><strong>' + moment(data.dateHour).format('dddd, MMMM Do YYYY, hh:mm') + '</strong><br/>Completed:<br/><strong>' + moment(data.dataHour).add(data.duration, 'minutes').format('dddd, MMMM Do YYYY, h:mm') + '</strong>')  
              .style('left', (xval + (w / 2) - 35) + 'px')   
              .style('top', (yval - 78) + 'px');
          })
          .on('mouseout', function(d, i) {
            div.transition()    
              .duration(500)    
              .style('opacity', 0);
          })
          .on('click', () => {
            // click event shows details below it:
            //  ** Event Name
            //  ** Event state and end
            //  ** Event Ticket
            //  ** Event assigned to, etc...
            alert('Show Event Information: Name, State, Date, Ticket Link, Person Assigned');
          });
      }
    });

    // add legend
    const legend =
      svg.append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => { return 'translate(' + ((width / 2) - 300) + ',485)'; });
    
    let nextX = 0;
    _.each(Object.keys(colors), (item, i) => {
      legend
        .append('circle')
          .attr('cx', nextX)
          .attr('cy', 4)
          .attr('r', 5)
          .style('fill', colors[item].color)
          .style('stroke', colors[item].color);
    
      nextX += 10;
      legend
        .append('text')
          .attr('id', colors[item].id + '-legend-item')
          .attr('class', 'legend-item')
          .attr('x', nextX)
          .attr('y', 7)
          .attr('dy', '.15em')
          .style('text-anchor', 'start')
          .style('font', '14px sans-serif')
          .style('font-weight', 'normal')
          .text(item);

      let bbox = d3.select('#' + colors[item].id + '-legend-item').node().getBBox();
      nextX += bbox.width + 15;
    });

    const hr = moment.duration(totalTime, 'minutes');
    const lhr = moment.duration(longest, 'minutes');
    const hrTotal = 14 * 24 * 60;
    document.getElementById('totalTime').innerHTML = 'Total: ' + hr.get('days') + ':' + pad(hr.get('hours'), 2) + ':' + pad(hr.get('minutes'), 2);
    document.getElementById('totalLostTime').innerHTML = (100 - ((totalTime / hrTotal) * 100).toFixed(0)) + '%';
    document.getElementById('longestTime').innerHTML = 'Longest: ' + lhr.get('days') + ':' + pad(lhr.get('hours'), 2) + ':' + pad(lhr.get('minutes'), 2);
    document.getElementById('longestLostTime').innerHTML = (100 - ((longest / hrTotal) * 100).toFixed(0)) + '%';

    this.drawBreakdownChart(breakdown, colors, totalTime);
  }

  drawBreakdownChart(breakdown, colors, totalTime) {
    if (this.props.events === null) {
      return;
    }

    const el = document.getElementById('breakdown-chart');
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    const width = el.clientWidth;
    const height = 525;
    const radius = Math.min(width, height) / 2;

    const x = d3.scale.linear()
      .range([0, 2 * Math.PI]);

    const y = d3.scale.sqrt()
      .range([0, radius]);

    const svg = d3.select(el)
      .append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + 10) + ')');

    const partition = d3.layout.partition()
      .sort(null)
      .value(function(d) { return d.size; });

    const arc = d3.svg.arc()
      .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
      .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
      .innerRadius(function(d) { return Math.max(0, y(d.y)); })
      .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

    let node = breakdown;
    const tt = d3.select('#sunburst-tooltip');
    const path =
      svg.datum(breakdown)
      .selectAll('path')
        .data(partition.nodes)
      .enter().append('path')
        .attr('class', 'sunburst')
        .attr('d', arc)
        .style('fill', function(d) { const n = (d.children ? d : d.parent).name; return (n === 'Offline') ? '#ffffff' : colors[n].color; })
        .on('click', click)
        .on('mouseover', function(d) {
          tt
            .transition()
            .duration(200)
            .style('opacity', .9);
          const md = moment.duration(d.size, 'minutes');
          const dur = md.get('days') + ':' + pad(md.get('hours'), 2) + ':' + pad(md.get('minutes'), 2);
          const pct = ((d.size / totalTime) * 100).toFixed(0) + '%';
          tt
            .html('Event: <strong>' + (d.parent.name !== 'Offline' ? d.parent.name + '::' + d.name : d.name) + '</strong><br/>Duration:<br/><strong>' + dur + ' (' + pct + ')</strong>');
        })
        .on('mouseout', function(d) {
          tt.transition()    
            .duration(500)    
            .style('opacity', 0);
        })
        .each(stash);

    function click(d) {
      node = d;
      path.transition()
        .duration(1000)
        .attrTween('d', arcTweenZoom(d));
    }

    function stash(d) {
      d.x0 = d.x;
      d.dx0 = d.dx;
    }

    function arcTweenData(a, i) {
      var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
      function tween(t) {
        var b = oi(t);
        a.x0 = b.x;
        a.dx0 = b.dx;
        return arc(b);
      }
      
      if (i == 0) {
       // If we are on the first arc, adjust the x domain to match the root node
       // at the current zoom level. (We only need to do this once.)
        var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
        return function(t) {
          x.domain(xd(t));
          return tween(t);
        };
      } else {
        return tween;
      }
    }

    function arcTweenZoom(d) {
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, 1]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function(d, i) {
        return i
            ? function(t) { return arc(d); }
            : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }
  }

  render() {
    return (
      <div className="main-container">
        <div className="row">
          <div className="col-xs-12">
            <div className="evtooltip" style={{'opacity': 0}}></div>
            <div id="events-view"></div>
          </div>
          <div className="col-xs-offset-1 col-xs-4">
            <div className="row">
              <div className="col-xs-12">
                <div className="panel panel-default bg-info panel-stat no-icon">
                  <div className="panel-body content-wrap">
                    <div className="value">
                      <h2 id="totalTime" className="font-header no-m"></h2>
                    </div>
                    <div className="detail text-right">
                      <div className="text-upper">Effeciency</div>
                      <small id="totalLostTime" style={{fontSize: '20px'}} className="text-muted m-d-2">x</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xs-12">
                <div className="panel panel-default bg-info panel-stat no-icon">
                  <div className="panel-body content-wrap">
                    <div className="value">
                      <h2 id="longestTime" className="font-header no-m">Longest: </h2>
                    </div>
                    <div className="detail text-right">
                      <div className="text-upper">Percent of Total Downtime</div>
                      <small id="longestLostTime" style={{fontSize: '20px'}} className="text-muted m-d-2">x</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xs-4 col-xs-offset-1">
            <div id="breakdown-chart"></div>
            <div id="sunburst-tooltip" className="dttooltip" style={{textAlign: 'center', opacity: 0}}>Hello World</div>
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
