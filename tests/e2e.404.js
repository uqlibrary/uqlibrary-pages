var minimalUql = require("./e2e.minimal.js");
var urlTest = 'http://localhost:5001/404.html';

module.exports = {
    '@tags': ['e2etest', '404'],
    'load uqlibrary 404 page - content' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(1280, 1000)
            .pause(20000) // allow saucelabs to get the page loaded
            .assert.containsText('#notFoundPage .title-text', 'Page not found')

            minimalUql.commonChecks(client, urlTest)

            client.end();
    }
};