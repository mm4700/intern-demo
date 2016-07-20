'use strict';

var _ = require('lodash'),
    async = require('async'),
    bodyparser = require('body-parser'),
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

var db = {};
MongoClient.connect(url, function(err, _db) {
  db.uncertainity = _db.collection('uncertainity');
  db.measurements = _db.collection('measurements');
  db.flowrates = _db.collection('flowrates');
  db.events = _db.collection('events');
});

process.on('uncaughtException', function (err) {
  console.log(err);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(require('compression')()); // gzip
app.use('/', express.static('build'));

app.post('/api/v1/uncertainity', function(req, res) {
  db.uncertainity.find({
    well: req.query.well,
    dateHour : {
      '$gte' : { '$date' : req.query.startDate },
      '$lte' : { '$date' : req.query.endDate }
    }
  }).toArray(function(err, results) {
    var resultSet = [];
    var dotySet = {};
    _.each(results, function(d) {
      var doty = moment(d.dateHour).dayOfYear()
      dotySet[doty] = (dotySet[doty]) ? dotySet[doty] + d.estPressure : value;
    });

    _.each(_.keys(dotySet).sort(function(a, b) { return a - b; }), function(d) {
      resultSet.push({
        dateHour: moment(), // TODO
        estPressure: dotySet[d] / dotySet[d].length, // avg
      })
    });
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
