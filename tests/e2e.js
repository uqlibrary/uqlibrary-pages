module.exports = {
  'load uqlibrary index page' : function (client) {
    client
        .url('http://dev-app.library.uq.edu.au:5001')
        .resizeWindow(1280, 800)
        .waitForElementVisible('uql-menu', 10000)
        .assert.elementPresent('uq-minimal-header', 'uq header component is present')
        .assert.elementPresent('uq-minimal-header uql-global-links', 'uq global links component is present')
        .assert.elementPresent('uql-menu', 'uq menu component is present')
        .assert.hidden('uql-menu-button', 'uq hamburger menu button component is hidden')
        .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
        .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
        .assert.elementPresent('paper-tabs', 'paper-tabs component is present')
        .saveScreenshot('screenshots/desktop.png')
        .end();
  }
};