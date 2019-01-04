var minimalUql = require('./e2e.minimal.js');
var urlTest = 'http://localhost:5001/404.html';

// note, 404s are served from drupal, so our 404 is only seen for attempted direct hits on assets, eg image files and scripts
module.exports = {
    '@tags': ['e2etest', '404'],
    'load uqlibrary 404 page - content' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(1280, 1000)
            .pause(20000) // allow saucelabs to get the page loaded
            .assert.containsText('#notFoundPage .title-text', 'Page not found')
            .assert.hidden('uql-menu-button', 'uq hamburger menu button uql-menu-button component is hidden');

            minimalUql.commonChecks(client, urlTest, 1280, 1000);

            client.end();
    }
};