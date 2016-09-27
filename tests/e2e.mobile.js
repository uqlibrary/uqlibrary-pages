module.exports = {
  'load uqlibrary index page in mobile sizing' : function (client) {
    client
      .url('http://localhost:5001')
      .resizeWindow(600, 800)
      .waitForElementVisible('uql-search-button', 10000)
      .assert.elementPresent('uql-menu-button', 'uql-menu-button present in mobile view')
      .assert.elementPresent('uq-minimal-header', 'uq header component is present')
      .assert.hidden('uq-minimal-header uql-global-links', 'header uq global links component is hidden in mobile view')
      .assert.elementPresent('uql-menu', 'uq menu component is present')
      .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
      .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
      .assert.elementPresent('paper-tabs', 'paper-tabs component is present')
      .saveScreenshot('screenshots/mobile.png')
      .end();
  }
};