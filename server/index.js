'use strict';

var _ = require('lodash'),
    async = require('async'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    express = require('express'),
    http = require('http'),
    moment = require('moment'),
    MongoClient = require('mongodb').MongoClient,
    os = require('os'),
    path = require('path'),
    util = require('util');

var app = express();
var httpServer = http.Server(app);

var url = 'mongodb://localhost:27017/demo';

var datasetMap = {
  rp: 'Reservoir Pressure',
  bhp: 'Bore Hole Pressure',
  whp: 'Well Head Pressure',
  bht: 'Bore Hole Temperature',
  wht: 'Well Head Temperature',
  q: 'Flow Rate'
};

var db = {};
MongoClient.connect(url, function(err, _db) {
  db.datasets = _db.collection('datasets');
  db.events = _db.collection('events');
});

process.on('uncaughtException', function (err) {
  console.log(err);
});

app.use(cors());
app.use(require('compression')()); // gzip
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../build')));
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/v1/data/:sensor', function(req, res) {
  var startDate = moment({ years: 2015, months: 0, days: 0, hours: 0, minutes: 0 });

  // handle datasets as well
  db.datasets.find({
    well: req.body.well,
    type: 'estimate',
    sensor: datasetMap[req.params.sensor],
    dateHour : {
      '$gte' : new Date(req.body.startDate),
      '$lte' : new Date(req.body.endDate)
    }
  }).toArray(function(err, results) {
    var resultSet = [];
    var dotySet = {};
    _.each(results, function(d) {
      var doty =
        req.body.grouping === 'hourly' ? moment(d.dateHour).minutes(0)
        : req.body.grouping === 'daily' ? moment(d.dateHour).hours(0).minutes(0)
        : req.body.grouping === 'weekly' ? moment(startDate).week(moment(d.dateHour).week())
        : moment(d.dateHour).date(1).hours(0).minutes(0);
      
      var asTimestamp = doty.valueOf();
      if (!dotySet[asTimestamp]) {
        if (req.body.aggregate === 'min' || req.body.aggregate === 'max') {
          dotySet[asTimestamp] = {est: null, up: null, low: null, measurement: null, total: 0};
        }
        else {
          dotySet[asTimestamp] = {est: 0, up: 0, low: 0, measurement: 0, total: 0};
        }
      }

      dotySet[asTimestamp].dateHour = asTimestamp;
      if (req.body.aggregate === 'min') {
        dotySet[asTimestamp].est = dotySet[asTimestamp].est === null || d.est < dotySet[asTimestamp].est ? d.est : dotySet[asTimestamp].est;
        dotySet[asTimestamp].up = dotySet[asTimestamp].up === null || d.up < dotySet[asTimestamp].up ? d.up : dotySet[asTimestamp].up;
        dotySet[asTimestamp].low = dotySet[asTimestamp].low === null || d.low < dotySet[asTimestamp].low ? d.low : dotySet[asTimestamp].low;
        dotySet[asTimestamp].measurement = dotySet[asTimestamp].measurement === null || d.measurement < dotySet[asTimestamp].measurement ? d.measurement : dotySet[asTimestamp].measurement;
        dotySet[asTimestamp].total++;
      }
      else if (req.body.aggregate === 'max') {
        dotySet[asTimestamp].est = dotySet[asTimestamp].est === null || d.est > dotySet[asTimestamp].est ? d.est : dotySet[asTimestamp].est;
        dotySet[asTimestamp].up = dotySet[asTimestamp].up === null || d.up > dotySet[asTimestamp].up ? d.up : dotySet[asTimestamp].up;
        dotySet[asTimestamp].low = dotySet[asTimestamp].low === null || d.low > dotySet[asTimestamp].low ? d.low : dotySet[asTimestamp].low;
        dotySet[asTimestamp].measurement = dotySet[asTimestamp].measurement === null || d.measurement > dotySet[asTimestamp].measurement ? d.measurement : dotySet[asTimestamp].measurement;
        dotySet[asTimestamp].total++;
      }
      else if (req.body.aggregate === 'avg' || req.body.aggregate === 'sum') {
        dotySet[asTimestamp].est += d.est;
        dotySet[asTimestamp].up += d.up;
        dotySet[asTimestamp].low += d.low;
        dotySet[asTimestamp].measurement += d.measurement;
        dotySet[asTimestamp].total++;
      }
    });

    _.each(_.keys(dotySet).sort(function(a, b) { return a - b; }), function(d) {
      if (req.body.aggregate === 'avg') {
        dotySet[d].est = dotySet[d].est / dotySet[d].total;
        dotySet[d].up = dotySet[d].up / dotySet[d].total;
        dotySet[d].low = dotySet[d].low / dotySet[d].total;
        dotySet[d].measurement = dotySet[d].measurement / dotySet[d].total;
      }
      
      resultSet.push(dotySet[d]);
    });

    res.status(200).send(resultSet);
  });
});

app.post('/api/v1/events', function(req, res) {
  var startDate = moment({ years: 2015, months: 0, days: 0, hours: 0, minutes: 0 });

  db.events.find({
    well: req.body.well,
    dateHour : {
      '$gte' : new Date(req.body.startDate),
      '$lte' : new Date(req.body.endDate)
    }
  }).toArray(function(err, results) {
    res.status(200).send(results);
  });
});

app.post('/api/v1/model', function(req, res) {
  var query = {
    well: req.body.well,
    type: 'measurement',
    sensor: datasetMap[req.body.sensor],
    dateHour : {
      '$gte' : new Date(req.body.startDate),
      '$lte' : new Date(req.body.endDate)
    }
  };

  db.datasets.find(query).toArray(function(err, results) {
    res.status(200).send(results);
  });
});

app.post('/api/v1/arrival-rates', function(req, res) {
  var query = {
    well: req.body.well,
    type: 'measurement',
    dateHour : {
      '$gte' : new Date(req.body.startDate),
      '$lte' : new Date(req.body.endDate)
    }
  };

  db.datasets.find(query)
    .toArray(function(err, results) {
      var set = [];
      var links = {};
      var sublinks = {};
      var minDate = Number.POSITIVE_INFINITY;
      var maxDate = 0;
      _.each(results, function(n, index) {
        if (!links[n.sensor]) {
          set.push({
            name: n.sensor,
            total: 0,
            measurements: []
          });

          links[n.sensor] = set[set.length - 1];
          sublinks[n.sensor] = {};
        }

        links[n.sensor].total++;

        var dh = new Date(n.dateHour).getTime();
        if (dh < minDate) {
          minDate = dh;
        }
        if (dh > maxDate) {
          maxDate = dh;
        }

        var i;
        if (req.body.grouping === 'hourly') {
          i = moment(n.dateHour).dayOfYear() + ' ' + moment(n.dateHour).hour();
        }
        else if (req.body.grouping === 'daily') {
          i = moment(n.dateHour).dayOfYear();
        }
        else if (req.body.grouping === 'weekly') {
          i = moment(n.dateHour).week();
        }
        else {
          i = moment(n.dateHour).month();
        }

        var subset = sublinks[n.sensor][i];
        if (!subset) {
          links[n.sensor].measurements.push([moment(n.dateHour).startOf('day').valueOf(), 1]);
          sublinks[n.sensor][i] = links[n.sensor].measurements[links[n.sensor].measurements.length - 1];
        }
        else {subset[1]++}
      });
      res.status(200).send({ minDate: minDate, maxDate: maxDate, data: set});
    });
});

app.post('/api/v1/sensor-availability', function(req, res) {
  var query = {
    well: req.body.well,
    type: 'measurement',
    dateHour : {
      '$gte' : new Date(req.body.startDate),
      '$lte' : new Date(req.body.endDate)
    }
  };

  db.datasets.find(query)
    .toArray(function(err, results) {
      var set = [];
      var links = {};
      var minDate = Number.POSITIVE_INFINITY;
      var maxDate = 0;
      
      _.each(Object.keys(datasetMap), function(k) {
        if (k !== 'q') {
          set.push({
            measure: datasetMap[k],
            interval: 60,
            data: []
          });

          links[datasetMap[k]] = {};

          var startDate = moment({ years: 2015, months: 0, days: 0, hours: 0, minutes: 0 });
          var endDate = moment({ years: 2015, months: 0, days: 14, hours: 23, minutes: 59 });
          while(startDate.isBefore(endDate)) {
            set[set.length - 1].data.push([startDate.valueOf(), 0]);
            links[datasetMap[k]][startDate.valueOf()] = set[set.length - 1].data[set[set.length - 1].data.length - 1];
            startDate.add(1, 'minutes');
          }
        }
      });

      _.each(results, function(n, index) {
        links[n.sensor][moment(n.dateHour).valueOf()][1] = 1;
      });

      res.status(200).send({ minDate: minDate, maxDate: maxDate, data: set});
    });
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

httpServer.listen(5001, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('server listening on port: %s', 5001);
});
