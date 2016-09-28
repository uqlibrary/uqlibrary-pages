module.exports = {
  'load simple page' : function (client) {
    client
      .url('http://localhost:5001')
      .pause(5000)
      .waitForElementVisible('body', 10000)
      .end();
  }
};
