# UQ Library Pages

[![Codeship Status for uqlibrary/uqlibrary-pages](https://codeship.com/projects/c9f3c4c0-ac6d-0133-af8d-1e5da553331a/status?branch=master)](https://codeship.com/projects/131650)
[![Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-pages.svg)](https://david-dm.org/uqlibrary/uqlibrary-pages)
[![Dev Dependency Status](https://david-dm.org/uqlibrary/uqlibrary-pages/dev-status.svg)](https://david-dm.org/uqlibrary/uqlibrary-pages)

This project contains pages for UQ Library website:

* UQ Library Home page - [demo](http://assets.library.uq.edu.au/master/pages/index.html)
* ACDBA - [demo](http://assets.library.uq.edu.au/master/pages/acdba.html)
* Secure File Access - [demo](http://assets.library.uq.edu.au/master/pages/secure.html?collection=exams&file=/0001/ccccc.pdf)

(Swap out alternate branch names for 'master' in this url to test other branches).

Instruction: Follow [polymer development style guide](http://polymerelements.github.io/style-guide/) for development.

* IMPORTANT! Before each change, update saucelab operating system versions for [nightwatch](https://github.com/uqlibrary/uqlibrary-pages/blob/master/bin/saucelabs/nightwatch.json) and [wct](https://github.com/uqlibrary/uqlibrary-pages/blob/master/wct.conf.js) by using the [saucelabs configurator](https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/) so we are testing against recent versions. Also check the [latest ESR version for firefox](https://www.mozilla.org/en-US/firefox/organizations/). (ESR versions are deployed in our Standard Environment across the Libraries).

## Quick-start

### Install dependencies

* Node.js, used to run JavaScript tools from the command line
* npm, the node package manager, installed with Node.js and used to install Node.js packages
* gulp, a Node.js-based build tool
* bower, a Node.js-based package manager used to install front-end packages (like Polymer)

With Node.js installed, run the following one liner from the root of your project:

```sh
npm install -g gulp-cli bower && npm install && bower install
```

### Serve / watch

```sh
gulp serve
```

This outputs an IP address you can use to locally test and another that can be used on devices connected to your network.

### Build & Vulcanize

```sh
gulp
```

Build and optimize the current project, ready for deployment. This includes vulcanization, image, script, stylesheet and HTML optimization and minification.

### Development workflow

#### Default setup for pages (index.html, etc)

##### IMS force login

IMS script should be included in the header to force on-campus users to login to be able to access content on S3 and Internet

```html
<!-- force IMS login for on-campus users -->
<script src="//www.library.uq.edu.au/js/ims.js"></script>
```

##### Preloader

Include following placeholder in body of html page and gulp task 'inject-preloader' to display standard loading screen

```html
<!-- Preloader/Unsupported browser message -->
<!-- preloader will be inserted by gulp task, do not remove -->
#preloader#
<!-- End of Preloader/Unsupported browser message -->
```

##### Unsupported browsers message

Include following placeholder and gulp task 'inject-browser-update' to include standard browser check

```html
<script>
//display browser update message for unsupported browsers,
//will be inserted by gulp task, do not remove
//bower_components/uqlibrary-browser-supported/browser-update.js
</script>
```

## Testing

There are two testing procedures for uqlibrary-pages: components testing and integration end to end testing.

Run `bin/test-setup.sh` to update settings for remote nightwatch.js testing and for wct unit testing
  
### Components testing ('unit testing' on codeship)

* On codeship, tests are run by bin/codeship-testing.sh. You may find reading through this file helpful to follow what happens.
* Tests are run with [Web Component Tester](https://github.com/Polymer/web-component-tester)
* Configuration is defined in wct.conf.js (various files such as wct.conf.js.local are renamed at run time), it contains configuration for local testing (Chrome / Firefox) and for remote testing on SauceLabs (IE, Edge, Safari, etc.)
* From bower_components all custom uqlibrary-* tests suites are collected with in test-setup.sh into app/test/index.html

Tests are run with gulp:

* setup the wct.conf.js file by choosing which file you want to use and copying, eg: `cp wct.conf.js.local wct.conf.js`
* `gulp test` to launch the tests (`gulp test:remote` for testing on SauceLabs)

When you run this command, you may get the error:

"Missing Sauce credentials. Did you forget to set SAUCE_USERNAME and/or SAUCE_ACCESS_KEY?"

To set these fields:

1. Visit the [uqlibrary-pages Codeship Environment Variable page](https://app.codeship.com/projects/131650/configure_environment)
2. Note the values for SAUCE_USERNAME and for SAUCE_ACCESS_KEY
3. export these as local variables on your box, eq:

    `$ export SAUCE_ACCESS_KEY='XXX'`

then run the gulp command again

### Integration testing

Integration testing is performed using [Nightwatch.js](http://nightwatchjs.org/). Integration testing is performed before deployment on Codeship.
SauceLabs are not running for master branch.

* test scripts are located in tests/* (eg tests/e2e.js)
* nightwatch.json - contains settings for local (bin/local/* ) and remote testing on SauceLabs (bin/saucelabs/*)
* nightwatch.js - is a test runner script

#### Local testing ('nightwatch local' on codeship)

1. Run Selenium server. Selenium is required to run tests locally.

    * On Linux, install jdk, then download the Selenium Standalone Server jar file from [here](https://www.seleniumhq.org/download/) and then run the server with:

        ```bash
        java -jar selenium-server-standalone-{VERSION}.jar
        ```
        You may want to create a bash alias for this.

    * On OSX, `brew install selenium-server-standalone` to install, and then run the server with:

        ```bash
        selenium-server -port 4444
        ```

1. Start server (will start server and project will be accessible at <http://localhost:5001>.)

    ```sh
    gulp serve:dist
    ```

1. Start testing
  
    ```sh
    cd bin/local
    ./nightwatch.js # never run it without some sort of tag as you dont want to run the minimal package directly
    ./nightwatch.js --env chrome --tag e2etest
    ```

#### SauceLabs testing ('test commands' on codeship)

* Testing requires Sauce Connect node module (installed with all node dependencies)
* Environment variables required for SauceLabs ($SAUCE_USERNAME, $SAUCE_ACCESS_KEY), `test-setup.sh` replaces placeholders in test setup stage
* Use [the saucelabs configurator](https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/) to get the latest browser versions for nightwatch.json (generally: [see the docs](https://wiki.saucelabs.com/display/DOCS/The+Sauce+Labs+Cookbook+Home).)
* Start server (will start server and project will be accessible at <http://localhost:5001>.)

    ```sh
    gulp serve:dist
    ```

* Run tests

    ```sh  
    cd bin/saucelabs
    ./nightwatch.js # never run nightwatch like this without some sort of tag as you   dont want to run the minimal package directly!
    ./nightwatch.js --env ie11 --tag e2etest
    ```

#### Functionality testing

Sometimes you will need to test functionality end to end or demonstrate in the browser the effect of a backend change.

* In repo api make your changes and merge to branch master and then staging
* For polymer repos, pick a branch name that is meaningful to the work you are doing, e.g. fixProblemX .
* In the repo uqlibrary-api,
  * Create a branch, as per the branch name above, fixProblemX
  * update file uqlibrary-api.html and change variable `baseApiUrl` to use domain `https://api.library.uq.edu.au/staging`
  * Push (there is no codeship build process for uqlibrary-api)
* Make any required changes to other polymer repos, in like named branches
* In the repo uqlibrary-pages
  * Create a branch, as per the branch name above
  * Create a deployment on codeship with the name matching the branch name & copy the deployment instructions from master
  * Update bower.json to point appropriate components to the feature branch, replacing the release number (this will almost certainly include uqlibrary-api)
  * `bower update` locally to see if you need to add any resolutions
  * Push and wait for build to pass
* `http://assets.library.uq.edu.au/fixProblemX/pages/index.html` should now work! (note the branch name we specified above is in the path)
* If you require the final page to show on <https://test.library.uq.edu.au/> (e.g. the customer has asked for an easier url), ask a sys admin to change the current "haproxy backend config" for test.library.uq.edu.au to point to the pages branch on assets, eg, in this case, a branch called newFrogs,  (Remember to get them to change it back before you delete the branch on completion!)
* When work is complete remember to update bower with release numbers to replace the branch names!!! Dont go to prod with branch names here!!

#### Canary Tests

* The canarytest branch is used in a weekly job started from AWS as [repo-periodic-test](https://ap-southeast-2.console.aws.amazon.com/ecs/home?region=ap-southeast-2#/clusters/default/scheduledTasks) in Scheduled Tasks that checks that our sites work in future browsers. See bin/codeship-test.sh 
* Scheduled Tasks: in Amazon, go to ECS > Clusters > Default > Scheduled Tasks tab which may be [here](https://ap-southeast-2.console.aws.amazon.com/ecs/home?region=ap-southeast-2#/clusters/default/scheduledTasks) and note task `repo-periodic-test` (more indicative naming would be `repo-periodic-test-pages`). 
* This can be run manually from the Tasks tab - (put in repo-periodic-test as the Name and I think you have to click open Advanced Options so you can add the same extra parameter as the scheduled task?)

#### 404s

It may appear that the 404 page is not used, for example, if you visit <https://www.library.uq.edu.au/404missing> you will get the Drupal template 404 (actually you are seeing a file that Dan has stolen from the drupal layout and put on one of the old servers and served via haproxy, but never mind that...), but the uqlibrary-pages 404 is loaded at times, for example, any missing image or .js on www.library.uq.edu.au which is loaded directly (for example when a user notes it is missing and tries it manually) will load the uqlibrary-pages 404, and some s3 buckets on AWS are configured to return the uqlibrarypages 404 when there is a missing file, eg <https://www.library.uq.edu.au/bomdata/doesntoexist>.

## Application Theming & Styling

Style guide for the project is [uqlibrary-styles](https://github.com/uqlibrary/uqlibrary-styles). [Demo here](http://uqlibrary.github.io/uqlibrary-styles/style-guide/demo/).

[Read more](https://www.polymer-project.org/1.0/docs/devguide/styling.html) about CSS custom properties.

### Styling

1. ***main.css*** - to define styles that can be applied outside of Polymer's custom CSS properties implementation. User for display of skeleton styles before Polymer is loaded.

These style files are located in the [styles folder](app/styles/).

## Deployment

Project is deployed to AWS S3 bucket via Codeship using `bin/codeship-deployment.sh` script

## Secure File Collection

`collection.html`

See api package file for description.
