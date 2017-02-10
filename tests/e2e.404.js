var minimalUql = require("./e2e.minimal.js");
var urlTest = 'http://localhost:5001/404.html';

module.exports = {
    '@tags': ['e2etest', '404'],
    'load uqlibrary 404 page - content' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(1280, 1000)
            .pause(20000) // allow saucelabs to get the page loaded
            .waitForElementVisible('uql-search-button', 5000)
            .assert.containsText('#notFoundPage .title-text', 'Page not found')
            .assert.containsText('#notFoundPage .card-content p:nth-child(1)', 'The requested page could not be found.')
            .assert.containsText('#notFoundPage .card-content p:nth-child(2)', 'Sorry about that, but here’s what you can do next:')
            .assert.containsText('#notFoundPage .card-content .body1 li:nth-child(1)', 'Try re-typing the address, checking for spelling, capitalisation and/or punctuation.')
            .assert.containsText('#notFoundPage .card-content .body1 li:nth-child(2)', 'Start again at the Library home page')
            .assert.containsText('#notFoundPage .card-content .body1 li:nth-child(3)', 'searching the Library site')
            .assert.containsText('#notFoundPage .card-content .body1 li:nth-child(4)', 'If you\'re sure the page should be at this address, email us at')

            minimalUql.commonChecks(client, urlTest)

            client.end();
    }
};