module.exports = {
  'load sinple page' : function (client) {
    client
      .url('http://localhost:5001')
      .resizeWindow(1280, 800)
      .waitForElementVisible('body', 10000)
      .end();
  }
};
