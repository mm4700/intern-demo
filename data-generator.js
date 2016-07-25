var _ = require('lodash');
var fs = require('fs');
var Chance = require('chance');
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;

var wells = [
  'Standard Draw 9-20-18-93',
  'CG Road 14-2-19-94',
  'Wild Rose 16-30-17-94',
  'Creston Nose 1-9-18-92',
  'CG Road 14-1-19-94',
  'Coal Gulch 7A-34-17-93',
  'Coal Gulch 9-28-17-93',
  'Flat Top Fed Gulch 13-23-14-93',
  'Tierney 16-12-19-94',
  'Robbers Gulch 12-30-14-92'
];

var url = 'mongodb://localhost:27017/demo';

var chance = new Chance();

var startDate = moment({ years: 2015, months: 0, days: 0, hours: 0, minutes: 0 });
var endDate = moment({ years: 2015, months: 0, days: 31, hours: 23, minutes: 59 });

MongoClient.connect(url, function(err, db) {
  var avv = db.collection('datasets');
  var ec = db.collection('events');
  //avv.remove({});
  //ec.remove({});

  _.each(_.range(1), function(i) {
    console.log('Well : ' + wells[i]);

    var currentDate = moment(startDate);
    var nextSensor = {
      'Reservoir Pressure': null,
      'Bore Hole Pressure': null,
      'Well Head Pressure': null,
      'Bore Hole Temperature': null,
      'Well Head Temperature': null,
      'Flow Rate': null
    };
    var nextEvent = null;
    var eventList = [];
    var datasetList = [];

    var eventTypes = [
      { name: 'Well Offline', maxDuration: 14 * 24 * 60 },
      { name: 'Wellhead Maintenance', maxDuration: 4 * 60 },
      { name: 'Slickline', maxDuration: 2 * 24 * 60 },
      { name: 'Braided Line', maxDuration: 5 * 24 * 60 },
      { name: 'Snubbing', maxDuration: 12 * 60 },
      { name: 'Workover', maxDuration: 6 * 24 * 60 }
    ];

    let index = 1;
    while (currentDate.isBefore(endDate)) {
      var eventChance = chance.weighted([0, 1, 2, 3, 4, 5, 6], [75000, 1, 34, 12, 12, 42, 20]);
      if (eventChance !== 0) {
        //console.log('event occurred', currentDate.toString(), eventChance, eventTypes[eventChance - 1]);

        var e = {};
        e.wellIndex = i;
        e.well = wells[i];
        e.dateHour = currentDate.toDate();
        e.event = eventTypes[eventChance - 1].name;
        var ii = chance.integer({ min: 1, max: eventTypes[eventChance - 1].maxDuration });
        e.duration = ii;
        //console.log('Adding to events');
        eventList.push(e);
        if (eventList.length >= 1000) {
          ec.insertMany(eventList);
          eventList = [];
        }

        nextEvent = moment(currentDate).add(ii, 'minutes');
      }
      
      if (nextEvent === null || currentDate.isAfter(nextEvent)) {
        nextEvent = null;
      }

      _.each(['Reservoir Pressure', 'Bore Hole Pressure', 'Well Head Pressure', 'Bore Hole Temperature', 'Well Head Temperature', 'Flow Rate'], function(fre) {
        var uncertainity = {};
        uncertainity.wellIndex = i;
        uncertainity.well = wells[i];
        uncertainity.type = 'estimate';
        uncertainity.sensor = fre;
        uncertainity.dateHour = currentDate.toDate();
        if (fre === 'Reservoir Pressure') {
          var u = chance.floating({ min: 13000, max: 15000, fixed: 2 });
          var ll = chance.floating({ min: 0, max: 1000, fixed: 2 });
          uncertainity.est = u; // chance value?
          uncertainity.up = u + ll;
          uncertainity.low = u - ll;
          uncertainity.measurement = u + chance.floating({ min: -50, max: 50, fixed: 2 });  
        }
        else if (fre === 'Bore Hole Pressure') {
          var u = chance.floating({ min: 8000, max: 11000, fixed: 2 });
          var ll = chance.floating({ min: 0, max: 500, fixed: 2 });
          uncertainity.est = u; // chance value?
          uncertainity.up = u + ll;
          uncertainity.low = u - ll;
          uncertainity.measurement = u + chance.floating({ min: -100, max: 100, fixed: 2 });  
        }
        else if (fre === 'Well Head Pressure') {
          var u = chance.floating({ min: 5000, max: 7500, fixed: 2 });
          var ll = chance.floating({ min: 0, max: 350, fixed: 2 });
          uncertainity.est = u; // chance value?
          uncertainity.up = u + ll;
          uncertainity.low = u - ll;
          uncertainity.measurement = u + chance.floating({ min: -50, max: 50, fixed: 2 });  
        }
        else if (fre === 'Bore Hole Temperature') {
          var u = chance.floating({ min: 180, max: 275, fixed: 2 });
          var ll = chance.floating({ min: 0, max: 40, fixed: 2 });
          uncertainity.est = u; // chance value?
          uncertainity.up = u + ll;
          uncertainity.low = u - ll;
          uncertainity.measurement = u + chance.floating({ min: -25, max: 25, fixed: 2 });  
        }
        else if (fre === 'Well Head Temperature') {
          var u = chance.floating({ min: 100, max: 200, fixed: 2 });
          var ll = chance.floating({ min: 0, max: 25, fixed: 2 });
          uncertainity.est = u; // chance value?
          uncertainity.up = u + ll;
          uncertainity.low = u - ll;
          uncertainity.measurement = u + chance.floating({ min: -5, max: 5, fixed: 2 });
        }
        else if (fre === 'Flow Rate') {
          var u = chance.floating({ min: 1000, max: 5000, fixed: 2 });
          var ll = chance.floating({ min: 0, max: 430, fixed: 2 });
          uncertainity.est = u; // chance value?
          uncertainity.up = u + ll;
          uncertainity.low = u - ll;
        }

        if (fre !== 'Flow Rate') {
          var uf = chance.weighted([
            chance.floating({min: 0, max: 10, fixed: 2}),
            chance.floating({min: 10, max: 20, fixed: 2}),
            chance.floating({min: 20, max: 30, fixed: 2}),
            chance.floating({min: 30, max: 40, fixed: 2}),
            chance.floating({min: 40, max: 50, fixed: 2}),
            chance.floating({min: 50, max: 60, fixed: 2}),
            chance.floating({min: 60, max: 70, fixed: 2}),
            chance.floating({min: 70, max: 80, fixed: 2}),
            chance.floating({min: 80, max: 90, fixed: 2}),
            chance.floating({min: 90, max: 100, fixed: 2})
          ], [1000000000, 100000000, 10000000, 1000000, 100000, 10000, 1000, 100, 10, 1]);
          uncertainity.uncertainity = uf;
        }

        // sensor data was available
        if ((nextEvent === null || (nextSensor[fre] === null || (nextSensor[fre].isBefore(currentDate) || nextSensor[fre].isSame(currentDate)))) && chance.bool({likelihood: 90})) {
          nextSensor[fre] = null;

          var mm = {};
          mm.wellIndex = i;
          mm.well = wells[i];
          mm.dateHour = currentDate.toDate();
          mm.type = 'measurement';
          mm.sensor = fre;
          var qty = chance.integer({ min: 1, max: 35 });
          _.each(_.range(qty), function(n) {
            var other = _.clone(mm);
            if (fre === 'Reservoir Pressure') {
              other.measurement = chance.floating({ min: 10000, max: 20000, fixed: 2 });  
            }
            else if (fre === 'Bore Hole Pressure') {
              other.measurement = chance.floating({ min: 8000, max: 11000, fixed: 2 });
            }
            else if (fre === 'Well Head Pressure') {
              other.measurement = chance.floating({ min: 4000, max: 8000, fixed: 2 });
            }
            else if (fre === 'Bore Hole Temperature') {
              other.measurement = chance.floating({ min: 160, max: 300, fixed: 2 });
            }
            else if (fre === 'Well Head Temperature') {
              other.measurement = chance.floating({ min: 90, max: 180, fixed: 2 });
            }

            var uf = chance.weighted([
              chance.floating({min: 0, max: 10, fixed: 2}),
              chance.floating({min: 10, max: 20, fixed: 2}),
              chance.floating({min: 20, max: 30, fixed: 2}),
              chance.floating({min: 30, max: 40, fixed: 2}),
              chance.floating({min: 40, max: 50, fixed: 2}),
              chance.floating({min: 50, max: 60, fixed: 2}),
              chance.floating({min: 60, max: 70, fixed: 2}),
              chance.floating({min: 70, max: 80, fixed: 2}),
              chance.floating({min: 80, max: 90, fixed: 2}),
              chance.floating({min: 90, max: 100, fixed: 2})
            ], [1000000000, 100000000, 10000000, 1000000, 100000, 10000, 1000, 100, 10, 1]);
            other.uncertainity = uf;
            if (fre !== 'Flow Rate') {
              datasetList.push(other);
              if (datasetList.length >= 1000) {
                avv.insertMany(datasetList);
                datasetList = [];
              }
            }
          });
        }
        else {
          // sensor data can be offline for up to 3 days max, minimum is 1 minute offline
          nextSensor[fre] = moment(currentDate);
          var o = chance.weighted([chance.integer({min: 1, max: 10}), chance.integer({min: 10, max: 6 * 60}), chance.integer({min: (6 * 60) + 1, max: 24 * 60}), chance.integer({min: 24 * 60, max: 3 * 24 * 60})], [100, 75, 5, 1]);
          nextSensor[fre].add(o, 'minutes');
        
          delete uncertainity.measurement;
        }

        datasetList.push(uncertainity);
        if (datasetList.length >= 1000) {
          avv.insertMany(datasetList);
          datasetList = [];
        }
      });

      currentDate.add(1, 'minutes');
      //console.log(currentDate.toString(), index++);
    }

    console.log('eventlist', eventList.length);
    ec.insertMany(eventList);
    avv.insertMany(datasetList);
  });

  db.close();
  setTimeout(function() {
    process.exit(0);
  }, 30000);
});