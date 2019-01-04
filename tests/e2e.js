var minimalUql = require('./e2e.minimal.js');
var urlTest = 'http://localhost:5001';

module.exports = {
    '@tags': ['e2etest', 'Main'],
    'test page components' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(1280, 1000)
            .pause(20000) // allow saucelabs to get the page loaded
            .assert.elementPresent('paper-tabs#sidebar-tabs', 'paper-tabs component is present for side bar')
            .assert.elementPresent('paper-tabs#sidebar-tabs', 'paper-tabs component is present for side bar')
            .assert.elementPresent('uqlibrary-search', 'search component is present')
            .assert.elementPresent('iron-pages', 'iron-pages component is present')
            .assert.hidden('uql-menu-button', 'uq hamburger menu button uql-menu-button component is hidden')

            // if IE11 fails because ES2016 syntax is used it will cause the iron-icons to be huuuge
            // this test will (hopefully) catch this so we can fix it before prod - or decide not to support IE11
            .assert.elementPresent('uqlibrary-search paper-button iron-icon', 'catalog search button is present')
            .getElementSize('uqlibrary-search paper-button iron-icon', function(element) {                
                if (client.capabilities.browserName === 'internet explorer') {
                    this.assert.equal(element.value.width, 24, 'check catalog search button is correct width');
                    this.assert.equal(element.value.height, 24, 'check catalog search button is correct height');
                }
            });

        minimalUql.commonChecks(client, urlTest, 1280, 1000);

        client.end();
    },
};
