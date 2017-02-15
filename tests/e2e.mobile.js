var minimalUql = require("./e2e.minimal.js");
var urlTest = 'http://localhost:5001';
var clientWidth = 600;
var clientHeight = 800;

module.exports = {
    'load uqlibrary index page in mobile sizing' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(600, 800)
            .pause(20000) // allow saucelabs to get the page loaded

        //Common checks from e2e.minimal.js
        minimalUql.commonChecks(client, urlTest)

        client.end()

    }
};