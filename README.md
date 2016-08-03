## UQ Library Pages

[ ![Codeship Status for uqlibrary/uqlibrary-pages](https://codeship.com/projects/c9f3c4c0-ac6d-0133-af8d-1e5da553331a/status?branch=master)](https://codeship.com/projects/131650)

This project contains pages for UQ Library website: 

> UQ Library Home page [demo](http://assets.library.uq.edu.au/master/pages/index.html)

 (Swap out alternate branch names for 'master' in this url to test other branches).
 
 Please, read [polymer development style guide](http://polymerelements.github.io/style-guide/) before development. 

### Quick-start 

#### Install dependencies

- Node.js, used to run JavaScript tools from the command line
- npm, the node package manager, installed with Node.js and used to install Node.js packages
- gulp, a Node.js-based build tool
- bower, a Node.js-based package manager used to install front-end packages (like Polymer)

With Node.js installed, run the following one liner from the root of your Polymer Starter Kit download:

```sh
npm install -g gulp bower && npm install && bower install
```

#### Serve / watch

```sh
gulp serve
```

This outputs an IP address you can use to locally test and another that can be used on devices connected to your network.

#### Build & Vulcanize

```sh
gulp
```

Build and optimize the current project, ready for deployment. This includes vulcanization, image, script, stylesheet and HTML optimization and minification.

### Development workflow

#### Default setup for pages (index.html, etc)

##### IMS force login
IMS script should be included in the header to force on-campus users to login to be able to access content on S3 and Internet

```
  <!-- force IMS login for on-campus users -->
  <script src="//www.library.uq.edu.au/js/ims.js"></script>
```

##### Preloader
Include following placeholder in body of html page and gulp task 'inject-preloader' to display standard loading screen

```
    <!-- Preloader/Unsupported browser message -->
    <!-- preloader will be inserted by gulp task, do not remove -->
    #preloader#
    <!-- End of Preloader/Unsupported browser message -->
```

##### Unsupported browsers message 
Include following placeholder and gulp task 'inject-browser-update' to include standard browser check

```
  <script>
    //display browser update message for unsupported browsers,
    //will be inserted by gulp task, do not remove
    //bower_components/uqlibrary-browser-supported/browser-update.js
  </script>
```

## Testing

There are two testing procedures for uqlibrary-pages: components testing and integration end to end testing
Run `bin/test-setup.sh` to update settings for remote nightwatch.js testing and for wct unit testing
  
### Components testing

* done with [Web Component Tester](https://github.com/Polymer/web-component-tester)
* configuration is defined in wct.conf.js, it contains configuration for local testing (chrome/firefox) and for remote testing on SauceLabs (IE/Safari/etc)
* from bower_components all custom uqlibrary-* tests suites are collected with in test-setup.sh into app/test/index.html
* tests are launched with gulp test (gulp test:remote for testing on SauceLabs)

### Integration testing

Integration testing is performed using [Nightwatch.js](http://nightwatchjs.org/). Integration testing is performed before deployment on Codeship.
SauceLabs are not running for master branch.

* test scripts are located in tests/* (eg tests/e2e.js)
* nightwatch.json - contains settings for local (bin/local/* ) and remote testing on SauceLabs (bin/saucelabs/*)
* nightwatch.js - is a test runner script

#### Local testing

* Run Selenium server. Selenium is required to run tests locally [Selenium Installer] (http://selenium-release.storage.googleapis.com/index.html)

```sh
  java -jar selenium-server-standalone-{VERSION}.jar
```

* start server (will start server and project will be accessible at http://localhost:5001)

```sh
  gulp serve:dist
```

* start testing

```sh
  cd bin/local
  ./nightwatch.js
  ./nightwatch.js --env chrome
```  

#### SauceLabs testing

* testing requires Sauce Connect node module (installed with all node dependencies)

* environment variables required for SauceLabs ($SAUCE_USERNAME, $SAUCE_ACCESS_KEY), `test-setup.sh` replaces placeholders in test setup stage

* start server (will start server and project will be accessible at http://localhost:5001)

```sh
  gulp serve:dist
```
* run tests 
 
```sh  
  cd bin/saucelabs 
  ./nightwatch.js
  ./nightwatch.js --env ie11  
```


## Application Theming & Styling

Style guide for the project is [uqlibrary-styles](https://github.com/uqlibrary/uqlibrary-styles) [demo](http://uqlibrary.github.io/uqlibrary-styles/style-guide/demo/)

[Read more](https://www.polymer-project.org/1.0/docs/devguide/styling.html) about CSS custom properties.

### Styling
1. ***main.css*** - to define styles that can be applied outside of Polymer's custom CSS properties implementation. User for display of skeleton styles before Polymer is loaded. 

These style files are located in the [styles folder](app/styles/).

## Deployment

Project is deployed to AWS S3 bucket via Codeship using `bin/codeship-deployment.sh` script
