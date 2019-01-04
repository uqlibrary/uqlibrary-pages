/*
 * hack tasks
 *
 * contains tasks to "fix" components that can't be forked or in process of PR
 *
 * */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var path = require('path');
var replace = require('gulp-replace-task');

var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

// remove when PR is done and cleared
gulp.task('monkey-patch-paper-input', function() {
  var regEx = new RegExp('bind-value="{{value}}"', 'g');
  return gulp.src(dist('**/elements.html'))
      .pipe(replace({
        patterns: [{ match: regEx, replacement: 'bind-value="{{value}}" value$="[[value]]" '}], 
        usePrefix: false}))
      .pipe(gulp.dest(dist()))
      .pipe($.size({title: 'monkey-patch-paper-input'}));
});
