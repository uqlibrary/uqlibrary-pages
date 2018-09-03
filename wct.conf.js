var path = require('path');

var ret = {
  'suites': ['app/test'],
  'webserver': {
    'pathMappings': []
  },
  plugins: {
    local: {
      browsers: [
        'chrome'
      ]
    },
    sauce: {
      browsers: [
        // {
        //   browserName: 'MicrosoftEdge',
        //   platform: 'Windows 10',
        //   version: '14.14393'
        // },
        {
          browserName: 'safari',
          platform: 'OS X 10.11',
          version: '10.0'
        }
      ]
    }
  }
};

var mapping = {};
var rootPath = (__dirname).split(path.sep).slice(-1)[0];

mapping['/components/' + rootPath  +
'/app/bower_components'] = 'bower_components';

ret.webserver.pathMappings.push(mapping);

module.exports = ret;
