module.exports = {
    commonChecks : function (client, urlTest, clientWidth, clientHeight) {

        client
            .url(urlTest)
            .resizeWindow(clientWidth, clientHeight)
            .waitForElementVisible('uql-search-button', 10000)
            .assert.elementPresent('uq-minimal-header', 'uq header component is present')
            .assert.elementPresent('uq-minimal-header uql-global-links', 'uq global links component is present')
            .assert.elementPresent('uql-menu', 'uq menu component is present')
            .assert.elementPresent('uql-connect-footer', 'uq connect footer component is present')
            .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
            .assert.containsText('.library-title a', 'Library')
            .assert.elementPresent('uql-askus-button', 'uql askus component is present')
            .assert.elementPresent('uql-search-button', 'uql search button is present')
            .assert.elementPresent('uql-login-button', 'uql login button is present')
            .assert.elementPresent('uq-minimal-footer', 'uq footer component is present')
            .assert.elementPresent('uq-minimal-footer .footer-legal-details a', 'Emergency Phone footer component is present')
            .assert.containsText('uq-minimal-footer .footer-legal-details .h6', 'Emergency')
        ;

        client.end();
    }
};
