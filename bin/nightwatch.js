#!/usr/bin/env node

var sauceConnectLauncher = require('../node_modules/sauce-connect-launcher/lib/sauce-connect-launcher');

var Logger = require('../node_modules/nightwatch/lib/util/logger.js');
var Nightwatch = require('../node_modules/nightwatch/lib/index.js');

sauceConnectLauncher({
  username: 'uqltest',
  accessKey: '504d3039-a9d6-4f6a-aee2-6a71ff5318e5',
  verbose: true,
  logger: console.log
}, function (err, sauceConnectProcess) {
  console.log("Started Sauce Connect Process");

  try {

    var done = function() {
      sauceConnectProcess.close(function () {
        console.log("Closed Sauce Connect process");
      });
    };

    Nightwatch.cli(function(argv) {
      console.log(Nightwatch);
      Nightwatch.runner(argv, done);
    });

  } catch (ex) {
    Logger.error('There was an error while starting the test runner:\n\n');
    process.stderr.write(ex.stack + '\n');
    process.exit(2);
  }
});

