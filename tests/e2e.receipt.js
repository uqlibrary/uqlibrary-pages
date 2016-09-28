module.exports = {
  'load uqlibrary payment receipt - standard header/menu/footer' : function (client) {
    client
        .url('http://localhost:5001/payment-receipt.html?Success=1&AmountPaid=1099&Receipt=ABC123')
        .resizeWindow(1280, 800)
        .pause(20000) // allow saucelabs to get the page loaded
        .waitForElementVisible('uql-search-button', 10000)
        .assert.elementPresent('uq-minimal-header', 'uq header component is present')
        .assert.elementPresent('uq-minimal-header uql-global-links', 'uq global links component is present')
        .assert.elementPresent('uql-menu', 'uq menu component is present')
        .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
        .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
        .end();
  },

  'uqlibrary payment receipt - should display receipt' : function (client) {
    client
      .url('http://localhost:5001/payment-receipt.html?Success=1&AmountPaid=1099&Receipt=ABC123')
      .resizeWindow(1280, 800)
      .pause(20000) // allow saucelabs to get the page loaded
      .waitForElementVisible('uql-search-button', 10000)
      .assert.elementPresent('uqlibrary-receipt', 'receipt component is present')
      .assert.containsText('#paymentReceipt .title-text', 'Payment receipt');
    client.end();
  }
};