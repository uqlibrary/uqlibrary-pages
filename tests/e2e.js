module.exports = {
  'load uqlibrary index page' : function (client) {
    client
        .url('http://assets.library.uq.edu.au/master/pages/index.html')
        //.url('http://localhost:5000')
        .waitForElementVisible('body', 1000)
        .assert.elementPresent('uq-minimal-header', 'uq header is displayed')
        .assert.elementPresent('uql-menu', 'uq menu is displayed')
        .assert.elementPresent('uql-connect-footer', 'uq connect footer is displayed')
        .assert.elementPresent('uq-minimal-footer', 'uq footer is displayed')
        .end();
  }
};