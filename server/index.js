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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(require('compression')()); // gzip
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', express.static('build'));

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

app.get('*', function(req, res) {
  res.render('index');
});

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

httpServer.listen(5001, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('server listening on port: %s', 5001);
});
