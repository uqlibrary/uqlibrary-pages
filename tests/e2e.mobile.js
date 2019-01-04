var minimalUql = require('./e2e.minimal.js');
var urlTest = 'http://localhost:5001';
var clientWidth = 600;
var clientHeight = 800;

module.exports = {
    '@tags': ['e2etest', 'mobile'],
    'load uqlibrary index page in mobile sizing' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(600, 800)
            .pause(20000) // allow saucelabs to get the page loaded
            .assert.elementPresent('uql-menu-button', 'uq hamburger menu button uql-menu-button component is present');

        //Common checks from e2e.minimal.js
        minimalUql.commonChecks(client, urlTest, 600, 800);

        client.end()

    }
};