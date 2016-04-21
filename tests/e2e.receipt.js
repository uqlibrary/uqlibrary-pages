module.exports = {
  
  'load uqlibrary payment receipt - standard header/menu/footer' : function (client) {
    client
        .url('http://dev-app.library.uq.edu.au:5001/payment-receipt.html?Success=1&AmountPaid=1099&Receipt=ABC123')
        .pause(5000)
        .waitForElementVisible('body', 1000)
        .assert.elementPresent('uq-minimal-header', 'uq header component is present')
        .assert.elementPresent('uq-minimal-header uql-global-links', 'uq global links component is present')
        .assert.elementPresent('uql-menu', 'uq menu component is present')
        .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
        .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
        .end();
  },

  'uqlibrary payment receipt - should display receipt' : function (client) {
    client
        .url('http://dev-app.library.uq.edu.au:5001/payment-receipt.html?Success=1&AmountPaid=1099&Receipt=ABC123')
        .pause(5000)
        .waitForElementVisible('body', 1000)
        .assert.elementPresent('uqlibrary-receipt', 'receipt component is present')
        .assert.containsText('#paymentReceipt .title-text', 'Payment receipt');
      client.end();
  }
};