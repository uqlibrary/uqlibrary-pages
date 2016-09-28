module.exports = {
  'load uqlibrary index page' : function (client) {
    client
        .url('http://localhost:5001')
        .resizeWindow(1280, 800)
        .waitForElementVisible('uql-global-links', 10000)
        .assert.elementPresent('uq-minimal-header', 'uq header component is present')
        .assert.elementPresent('uq-minimal-header uql-global-links', 'uq global links component is present')
        .assert.elementPresent('uql-menu', 'uq menu component is present')
        .assert.hidden('uql-menu-button', 'uq hamburger menu button uql-menu-button component is hidden')
        .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
        .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
        .assert.containsText('.library-title a', 'UQ Library')
        .assert.elementPresent('uql-askus-button', 'uql askus component is present')
        .assert.elementPresent('uql-search-button', 'uql search button is present')
        .assert.elementPresent('uql-login-button', 'uql login button is present')
        .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
        .assert.elementPresent('uq-minimal-footer uql-global-links', 'uq global links footer component is present')
        .assert.containsText('uq-minimal-footer .footer-uq-details li', 'Authorised by:')
        .assert.elementPresent('uq-minimal-footer .footer-legal-details a'
                               , 'Emergency Phone footer component is present')
        .assert.containsText('uq-minimal-footer .footer-legal-details .h6', 'Emergency')
//.saveScreenshot('screenshots/e2ejs.png')
        .end();
  },

  'test sidebar components' : function (client) {
    client
      .url('http://localhost:5001')
      .resizeWindow(1280, 800)
      .waitForElementVisible('uql-global-links', 10000)
      .assert.elementPresent('paper-tabs', 'paper-tabs component is present')
      .assert.elementPresent('iron-pages', 'iron-pages component is present')

      .end();
  },

  'test search components' : function (client) {
    client
      .url('http://localhost:5001')
      .resizeWindow(1280, 800)
      .waitForElementVisible('uql-global-links', 10000)
      .assert.elementPresent('.title-text', 'Search Title is present')
      .assert.containsText('.title-text', 'UQ Library Search')
      .end();
  }
};
