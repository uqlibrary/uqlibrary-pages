var minimalUql = require('./e2e.minimal.js');
var urlTest = 'http://localhost:5001/payment-receipt.html?Success=1&AmountPaid=1099&Receipt=ABC123';
var clientWidth = 1280;
var clientHeight = 1000;

module.exports = {
    '@tags': ['e2etest', 'receipt'],
    'load uqlibrary payment receipt - should display receipt' : function (client) {

        client
            .url(urlTest)
            .resizeWindow(clientWidth, clientHeight)
            .pause(20000) // allow saucelabs to get the page loaded
            .waitForElementVisible('uql-search-button', 10000)
            .assert.elementPresent('uqlibrary-receipt', 'receipt component is present')
            .assert.containsText('#paymentReceipt .title-text', 'Payment receipt')
            .assert.hidden('uql-menu-button', 'uq hamburger menu button uql-menu-button component is hidden')
        ;

        minimalUql.commonChecks(client, urlTest, clientWidth, clientHeight);

        client.end();
    }
};