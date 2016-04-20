module.exports = {
  'load uqlibrary index page' : function (client) {
    client
        .url('http://localhost:5001')
        .pause(5000)
        .waitForElementVisible('body', 1000)
        .assert.elementPresent('uq-minimal-header', 'uq header component is present')
        .assert.elementPresent('uq-minimal-header uql-global-links', 'uq global links component is present')
        .assert.elementPresent('uql-menu', 'uq menu component is present')
        .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
        .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
        .end();
  },

  'test sidebar components' : function (client) {
    client
        .url('http://localhost:5001')
        .pause(5000)
        .waitForElementVisible('body', 1000)
        .assert.elementPresent('paper-tabs', 'paper-tabs component is present')
        .end();
  }
};