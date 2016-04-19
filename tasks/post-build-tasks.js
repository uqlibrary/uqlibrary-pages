/* 
* post build tasks
*
* contains tasks that are not required for build, but required for go-live
* eg common replacement tasks
* */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var replace = require('gulp-replace-task');
var fs = require('fs');

var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var gaConfig = {
  id : 'UA-4365437-1',
  url : 'www.library.uq.edu.au',
  domain : 'library.uq.edu.au'
}

// inject preloader.html code into html pages
gulp.task('inject-preloader', function() {

  var regEx = new RegExp("#preloader#", "g");
  var browserUpdate = fs.readFileSync("app/bower_components/uqlibrary-browser-supported/preloader.html", "utf8");

  return gulp.src(dist('*'))
      .pipe(replace({patterns: [{ match: regEx, replacement: browserUpdate}], usePrefix: false}))
      .pipe(gulp.dest(dist()))
      .pipe($.size({title: 'inject-preloader'}));
});

// inject browser-update.js code into html pages
gulp.task('inject-browser-update', function() {

  var regEx = new RegExp("//bower_components/uqlibrary-browser-supported/browser-update.js", "g");
  var browserUpdate=fs.readFileSync("app/bower_components/uqlibrary-browser-supported/browser-update.js", "utf8");

  return gulp.src(dist('*'))
      .pipe(replace({patterns: [{ match: regEx, replacement: browserUpdate}], usePrefix: false}))
      .pipe(gulp.dest(dist()))
      .pipe($.size({title: 'inject-browser-update'}));
});

// inject values for GA
gulp.task('inject-ga-values', function() {

  if (process.env.CI_BRANCH !== "production")
    return;

  var gaIdEx = new RegExp("<GA-TRACKING-ID>", "g");
  var gaUrlEx = new RegExp("<GA-WEBSITE-URL>", "g");
  var gaDomainEx = new RegExp("<GA-COOKIE-DOMAIN>", "g");

  return gulp.src(dist('**/elements/*.js'))
      .pipe(replace({patterns: [{ match: gaIdEx, replacement: gaConfig.id}], usePrefix: false}))
      .pipe(replace({patterns: [{ match: gaUrlEx, replacement: gaConfig.url}], usePrefix: false}))
      .pipe(replace({patterns: [{ match: gaDomainEx, replacement: gaConfig.domain}], usePrefix: false}))
      .pipe(gulp.dest(dist()))
      .pipe($.size({title: 'inject-ga-values'}));
});