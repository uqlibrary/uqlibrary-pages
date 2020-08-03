#!/usr/bin/env node
var Logger = require('../../node_modules/nightwatch/lib/util/logger.js');
var Nightwatch = require('../../node_modules/nightwatch/lib/index.js');

try {

  Nightwatch.cli(function(argv) {
    console.log(Nightwatch);
    Nightwatch.runner(argv);
  });

} catch (ex) {
  Logger.error('There was an error while starting the test runner:\n\n');
  process.stderr.write(ex.stack + '\n');
  process.exit(2);
}

