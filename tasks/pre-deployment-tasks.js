/* 
 * pre-deployment tasks
 *
 * contains tasks for managing browser caching, eg revision number for resources, cache manifest update
 *
 * */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var revDelete = require('gulp-rev-delete-original');
var path = require('path');
var replace = require('gulp-replace-task');
var fs = require('fs');

var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var absolutePath = function () {
  var branch = "";
  if (process.env.CI_BRANCH !== "production"){
    branch = process.env.CI_BRANCH + "/";
  }

  return '//assets.library.uq.edu.au/' + branch;
};

// Update application cache manifest version and set all paths to absolute
// use only for deployment
gulp.task('app-cache-version-update', function() {

  var regExVersion = new RegExp("<VERSION>", "g");
  var regExPath = new RegExp("/pages", "g");
  var absPath = absolutePath();

  var timeStamp = new Date();

  return gulp.src(dist('**/*.appcache'))
      .pipe(replace({patterns: [{ match: regExVersion, replacement: timeStamp.getTime()}], usePrefix: false}))
      .pipe(replace({patterns: [{ match: regExPath, replacement: absPath + 'pages'}], usePrefix: false}))
      .pipe(gulp.dest(dist()));
});

gulp.task('rev-appcache-update', function () {
  var json = JSON.parse(fs.readFileSync(dist() + "/rev-manifest.json"));

  var source = gulp.src(dist() + '/index.appcache');
  for (var key in json) {
    if (!json.hasOwnProperty(key)) continue;
    source.pipe($.replace(key, json[key]));
  }

  return source.pipe(gulp.dest(dist()));
});

gulp.task('remove-rev-file', function () {
  return gulp.src(dist() + '/rev-manifest.json', { read: false }).pipe($.rimraf());
});

gulp.task('rev', function () {
  var fileFilter = [
    '**/elements.html',
    '**/elements.js',
    '**/main.css',
    '**/app.js'
  ];

  var filter = $.filter(fileFilter, {restore: true});
  return gulp.src('dist/**')
      .pipe(filter)
      .pipe(rev())
      .pipe(revDelete())
      .pipe(filter.restore)
      .pipe(revReplace())
      .pipe(gulp.dest(dist()))
      .pipe(rev.manifest())
      .pipe(gulp.dest(dist()));
});

gulp.task('rev-replace-polymer-fix', function () {
  // Polymer does not use a rev-replace compatible string so we need to manually replace
  return gulp.src('dist/**/*.html')
      .pipe(revReplace({
        manifest: gulp.src('dist/rev-manifest.json')
      }))
      .pipe(gulp.dest(dist()));
});

gulp.task('monkey-patch-rev-manifest', function () {
  return gulp.src('dist/rev-manifest.json')
      .pipe($.replace('elements/elements', 'elements'))
      .pipe(gulp.dest(dist()));
});