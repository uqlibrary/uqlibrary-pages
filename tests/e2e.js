var minimalUql = require("./e2e.minimal.js");
var urlTest = 'http://localhost:5001';

module.exports = {
    '@tags': ['e2etest', 'Main'],
    'test sidebar components' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(1280, 1000)
            .pause(20000) // allow saucelabs to get the page loaded
            .assert.elementPresent('paper-tabs#sidebar-tabs', 'paper-tabs component is present for side bar')
            .assert.elementPresent('paper-tabs#sidebar-tabs', 'paper-tabs component is present for side bar')
            .assert.elementPresent('uqlibrary-search', 'search component is present')
            .assert.elementPresent('iron-pages', 'iron-pages component is present')
            .end();
    },

    'test search components' : function (client) {

            //Common checks from e2e.minimal.js
            minimalUql.commonChecks(client, urlTest)

            client.end();
    }
};
