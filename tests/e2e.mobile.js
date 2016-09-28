module.exports = {
  'load uqlibrary index page in mobile sizing' : function (client) {
    client
      .url('http://localhost:5001')
      .resizeWindow(600, 800)
      .pause(20000) // allow saucelabs to get the page loaded
      .waitForElementVisible('uql-search-button', 10000)
      .assert.elementPresent('uql-menu-button', 'uql-menu-button present in mobile view')
      .assert.elementPresent('uq-minimal-header', 'uq header component is present')
      .assert.hidden('uq-minimal-header uql-global-links', 'header uq global links component is hidden in mobile view')
      .assert.elementPresent('uql-menu-button', 'uq hamburger menu button uql-menu-button component is present')
      .assert.elementPresent('uql-menu', 'uq menu component is present')
      .assert.containsText('.library-title a', 'UQ Library')
      .assert.elementPresent('uql-askus-button', 'uql askus component is present')
      .assert.elementPresent('uql-search-button', 'uql search button is present')
      .assert.elementPresent('uql-login-button', 'uql login button is present')
      .assert.elementPresent('paper-tabs', 'paper-tabs component is present')
      .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
      .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
      .assert.elementPresent('uq-minimal-footer uql-global-links', 'uq global links footer component is present')
      .assert.containsText('uq-minimal-footer .footer-uq-details li', 'Authorised by:')
      .assert.elementPresent('uq-minimal-footer .footer-legal-details a'
                             , 'Emergency Phone footer component is present')
      .assert.containsText('uq-minimal-footer .footer-legal-details .h6', 'Emergency')
//.saveScreenshot('screenshots/e2emobile.png')
      .end();
  }
};