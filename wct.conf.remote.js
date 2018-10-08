var path = require('path');

var ret = {
    'suites': ['app/test'],
    'webserver': {
        'pathMappings': []
    },
    plugins: {
        sauce: {
            browsers: [
                'Windows 10/microsoftedge@16',
                'Windows 10/chrome@68',
                'Windows 10/firefox@61',
                'OS X 10.13/safari@11.1',
                'OS X 10.13/firefox@61',
                'OS X 10.13/chrome@68'
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
