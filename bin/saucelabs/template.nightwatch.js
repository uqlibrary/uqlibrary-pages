#!/usr/bin/env node

var sauceConnectLauncher = require('../../node_modules/sauce-connect-launcher/lib/sauce-connect-launcher');

var Logger = require('../../node_modules/nightwatch/lib/util/logger.js');
var Nightwatch = require('../../node_modules/nightwatch/lib/index.js');

sauceConnectLauncher(
  {
    username: '<SAUCE_USERNAME>',
    accessKey: '<SAUCE_ACCESS_KEY>',
    verbose: true,
    logger: console.log,
    verboseDebugging: false,
    logfile: "/tmp/sc.log"
  },

  function (err, sauceConnectProcess) {

    if (err) {
      // Ignore.

      // console.log("Error: ", err.message);
      // return;
    }

    console.log("Started Sauce Connect Process");

    try {

      var done = function() {
        if (sauceConnectProcess) {
          sauceConnectProcess.close(function() {
            console.log("Closed Sauce Connect process");
          })
        }
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
  }
);
