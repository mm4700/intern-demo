var _ = require('lodash');
var fs = require('fs');
var Chance = require('chance');
var moment = require('moment');

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

var chance = new Chance();

var startDate = moment({ years: 2015, months: 0, days: 0, hours: 0, minutes: 0 });
var endDate = moment({ years: 2015, months: 0, days: 31, hours: 23, minutes: 59 });

_.each(_.range(1), function(i) {
  var currentDate = moment(startDate);
  var nextSensor = null;
  var nextRate = null;

  console.log('st', startDate.toString(), currentDate.toString(), endDate.toString());

  fs.writeFileSync('uncertainity-' + i + '.csv', 'dateHour,estPressure,upPressure,lowPressure\n');
  fs.writeFileSync('measurements-' + i + '.csv', 'dateHour,pressure\n');
  fs.writeFileSync('flowrates-' + i + '.csv', 'dateHour,rate\n');
  while (currentDate.isBefore(endDate)) {
    var uncertainity = [];
    var measurements = [];
    var flowrate = [];
    uncertainity.push(currentDate.format("MM/DD/YYYY HH:mm:ss"));
    var u = chance.floating({ min: 10, max: 100, fixed: 2 });
    uncertainity.push(u); // chance value?
    uncertainity.push(u + chance.floating({ min: 0, max: 100 - u, fixed: 2 }));
    uncertainity.push(u - chance.floating({ min: 0, max: 100 - u, fixed: 2 }));
    fs.appendFileSync('uncertainity-' + i + '.csv', uncertainity.join(',') + '\n');

    // sensor data was available
    if ((nextSensor === null || (nextSensor.isBefore(currentDate) || nextSensor.isSame(currentDate))) && chance.bool({likelihood: 90})) {
      nextSensor = null;
      measurements.push(currentDate.format("MM/DD/YYYY HH:mm:ss"));
      var qty = chance.integer({ min: 1, max: 35 });
      _.each(_.range(qty), function(n) {
        measurements.push(chance.floating({ min: 0, max: 100, fixed: 2 }));
      });
      fs.appendFileSync('measurements-' + i + '.csv', measurements.join(',') + '\n');
    }
    else {
      // sensor data can be offline for up to 3 days max, minimum is 1 minute offline
      nextSensor = moment(currentDate);
      var o = chance.weighted([chance.integer({min: 1, max: 10}), chance.integer({min: 10, max: 6 * 60}), chance.integer({min: (6 * 60) + 1, max: 24 * 60}), chance.integer({min: 24 * 60, max: 3 * 24 * 60})], [100, 75, 5, 1]);
      nextSensor.add(o, 'minutes');
    }

    // sensor data was available for flow rate
    if ((nextRate === null || (nextRate.isBefore(currentDate) || nextRate.isSame(currentDate))) && chance.bool({likelihood: 90})) {
      flowrate.push(currentDate.format("MM/DD/YYYY HH:mm:ss"));
      flowrate.push(chance.floating({ min: 250, max: 600, fixed: 2 }));
      fs.appendFileSync('flowrates-' + i + '.csv', flowrate.join(',') + '\n');
    }
    else {
      // sensor data can be offline for up to 3 days max, minimum is 1 minute offline
      nextRate = moment(currentDate);
      var o = chance.weighted([chance.integer({min: 1, max: 10}), chance.integer({min: 10, max: 6 * 60}), chance.integer({min: (6 * 60) + 1, max: 24 * 60}), chance.integer({min: 24 * 60, max: 3 * 24 * 60})], [100, 75, 5, 1]);
      nextRate.add(o, 'minutes');
    }

    currentDate.add(1, 'minutes');
  }
});
