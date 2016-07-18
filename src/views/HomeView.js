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
    const { dispatch } = this.props;

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

    const datasetState = {};
    datasetState[dataset] = m;
    this.setState(datasetState);
  }

  //mydata.minDate = new Date(d3.min(mydata.data1.map(function(d) { return d.date})));
  //mydata.maxDate = new Date(d3.max(mydata.data1.map(function(d) { return d.date})));

  /*drawChart() {
    const el = document.getElementById('content');

    const margin = { top: 10, right: 55, bottom: 100, left: 40 };
    const margin2 = { top: 430, right: 33, bottom: 20, left: 40 };
    const width = document.getElementById('content').clientWidth - margin.left - margin.right;
    const height = (document.getElementById('content').clientHeight - 100) - margin.top - margin.bottom;
    const height2 = 100 - margin2.top - margin2.bottom;

    const svg = d3.select(el)
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

    const headingsArray = Object.keys(this.state.uncertainityData[0]).filter(d => d !== 'date');
    const colorsArray =['#E2C6DA', '#9FA47B', '#BABC94', '#CBCB47', '#ECF370', '#EADD2C', '#92CD00'];

    const x = d3.time.scale()
      .domain([mydata.minDate, mydata.maxDate])
      .range([0, width]);

    const x2 = d3.time.scale()
      .domain(x.domain())
      .range([0, width]);
    
    const y = d3.scale.linear().range([height, 0])
      .domain([10, d3.max(mydata.data1.map(d => { return d.upPressure1; }))]);

    const y1 = d3.scale.linear().range([height, 0])
      .domain([500, d3.max(mydata.data3.map(d => { return d.rate; }))]);

    const y2 = d3.scale.linear().range([height2, 0])
      .domain(y.domain());

    const xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%e/%-m %H'));

    const xAxis2 = d3.svg.axis()
      .scale(x2)
      .orient('bottom')
      .tickFormat(d3.time.format('%e/%-m'));

    const yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    const yAxis1 = d3.svg.axis()
        .scale(y1)
        .orient('right');

    const yAxis2 = d3.svg.axis()
        .scale(y2)
        .orient('left');

    const tooltip = d3.select(el)
      .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    const brush = d3.svg.brush()
      .x(x2)
      .on('brush', brushed);

    function brushed() {
      x.domain(brush.empty() ? x2.domain() : brush.extent());
      primary.selectAll('path.line').attr('d', d => {return line(d.values)});
      primary.selectAll('path.line2').attr('d', d => {return line2(d.values)});
      primary.selectAll('.dot').attr('cx', xMap);
      primary.select('.x.axis').call(xAxis);
    }

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

    const clip = svg.append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
        .attr('id', 'clip-rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', width)
        .attr('height', height);

    const rect = svg.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white');
       

        var primary = svg.append("g")
            .attr("class", "primary")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var timeline = svg.append("g")
            .attr("class", "timeline")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

         
        primary.selectAll(".chart")
            .data(chart1data).enter().append("path")
            .attr("class", "line")
            .attr("clip-path", "url(#clip)")
            .attr("id","linechart")
            .attr("d", function(d) { return line(d.values);})
            .style("stroke", function(d) { return color(d.name); });


        primary.selectAll(".chart")
            .data(rateData).enter().append("path")
            .attr("class", "line2")
            .attr("id","linechart")
            .attr("d", function(d) { return line2(d.values);})
            .style("stroke", function(d) { return color(d.name); });

        primary.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        primary.append("text")
            .attr("x", 920)
            .attr("y", 410)// text label for the x axis
            .style("text-anchor", "end")
            .text("Time");

        
        //clip path
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);  

        primary.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("pressure");

        primary.append("g")
            .attr("class", "y axis1")
            .call(yAxis1)
            .attr("transform", "translate(" + width + " ,0)")   
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("rate");

        // Add the scatterplot
        var xMap = function(d){ return x(d.date)},
            yMap = function(d){ return y(d.est)},
            yMap1 = function(d){ return y(d.est1)};

        primary.selectAll(".chart")
        //mydots.selectAll(".dot")
            .data(mydata.data2)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("clip-path", "url(#clip)")
            .style("fill", "#bc90ba")
            .attr("r", 2.8)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .on("mouseover", function (d) {                                    //hover event
                tooltip.transition()
                    .duration(80)
                    .style("opacity", .9)
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
                var dist = 0;
                mydata.data1.forEach(function (n) {
                    if (n.date === d.date) {
                        dist = d.est - n.estPressure ;
                      

                        if (dist < 0) {dist = dist * -1;}
                        
                    }
                });

                tooltip.html("<h1>" + "X: " + d.dateHour + " Y: " + d.est.toFixed(2) + " uncertainty:" + dist.toFixed(3) + "</h1>");
               
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);

            });

        primary.selectAll(".chart")
        //mydots.selectAll(".dot")
            .data(mydata.data2)
            .enter().append("circle")
            .attr("class", "dot")
            .style("fill", "#eed102")
            .attr("r", 2.8)
            .attr("id", "clip")
            .attr("cx", xMap)
            .attr("cy", yMap1)
            .on("mouseover", function (d) {                                    //hover event
                tooltip.transition()
                    .duration(80)
                    .style("opacity", .9)
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
                var 
                dist1 = 0;
              //  mydata.data1.filter(function(n){ return n.date === d.date})
                mydata.data1.forEach(function (n) {
                    if (n.date === d.date) {
                        dist1 = d.est1 - n.estPressure1;

                      
                        if (dist1 < 0) {dist1 = dist1 * -1;}
                    }
                    else if (n.time < d.t) {                                          // linear interpolation for the t
                        lowerbound = n;
                    }                 
                }); 
                tooltip.html("<h1>" + "X: " + d.dateHour + " Y: " + d.est1.toFixed(2) + " uncertainty:" + dist1 + "</h1>");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);

            });


        timeline.append("g")
            .attr("class", "x axis2")
            .attr("transform", "translate(0," +height2 + ")")  //
            .call(xAxis2);

        timeline.append("text")
            .attr("x", 450)
            .attr("y", 300)// text label for the x axis
            .style("text-anchor", "end")
            .text("Time");
            


        timeline.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2);

      var legend = primary.selectAll(".legend")
          .data(headingsArray)
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });




      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", width - 10)
          .attr("width", 15)
          .attr("height", 13)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", width-10 )
          .attr("y", 6)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .style("stroke", "#777672")
            .on("click", function(){
            // Determine if current line is visible
            var active   = linechart.active ? false : true,
              newOpacity = active ? 0 : 1;
            // Hide or show the elements
            d3.selectAll("#linechart").style("opacity", newOpacity);        // Update whether or not the elements are active
            linechart.active = active; 
        })
          .text(function(d) {return d;});


        }
  }*/

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