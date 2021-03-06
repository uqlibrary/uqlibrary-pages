var minimalUql = require('./e2e.minimal.js');
var urlTest = 'http://localhost:5001';
var clientWidth = 600;
var clientHeight = 800;

module.exports = {
    '@tags': ['e2etest', 'mobile'],
    'load uqlibrary index page in mobile sizing' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(clientWidth, clientHeight)
            .pause(20000) // allow saucelabs to get the page loaded
            .assert.elementPresent('uql-menu-button', 'uq hamburger menu button uql-menu-button component is present');

        minimalUql.commonChecks(client, urlTest, clientWidth, clientHeight);

        client.end();
    }
};