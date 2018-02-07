'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var historyApiFallback = require('connect-history-api-fallback');
var packageJson = require('./package.json');
var crypto = require('crypto');

var ensureFiles = require('./tasks/ensure-files.js');

var requireDir = require('require-dir');
requireDir('./tasks');

var replace = require('gulp-replace-task');
var taskList = require('gulp-task-listing');
var argv = require('yargs').argv;
// var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');

var exitCode = 0;

// var ghPages = require('gulp-gh-pages');
var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var styleTask = function(stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('app', stylesPath, src);
    }))
    //Concatenate all SASS files into 1 compiled CSS file
    .pipe($.sass({style: 'expanded'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    //Save a copy next to the original SASS file
    .pipe(gulp.dest('app/' + stylesPath),{overwrite:true})
    //Save it to a temp dir
    .pipe(gulp.dest('.tmp/' + stylesPath),{overwrite:true})
    //Minify the CSS
    .pipe($.minifyCss())
    //Copy it to the distribution folder
    .pipe(gulp.dest(dist(stylesPath),{overwrite:true}))
    .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = function(src, dest) {
  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = function(src, dest) {

  return gulp.src(src)
    .pipe($.useref())

    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))

    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.useref())


    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({
      title: 'html'
    }));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
  return styleTask('styles', ['**/*.scss']);
});

gulp.task('elements', function() {
  return styleTask('elements', ['**/*.css']);
});

// Ensure that we are not missing required files for the project
// "dot" files are specifically tricky due to them being hidden on
// some systems.
gulp.task('ensureFiles', function(cb) {
  var requiredFiles = ['.bowerrc'];

  ensureFiles(requiredFiles.map(function(p) {
    return path.join(__dirname, p);
  }), cb);
});

// Optimize images
gulp.task('images', function() {
  return imageOptimizeTask('app/images/**/*', dist('images'));
});

// Copy all files at the root level (app)
gulp.task('copy', function() {
  var app = gulp.src([
    'app/*',
    '!app/test',
    '!app/elements',
    '!app/bower_components',
    '!**/.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest(dist()));

  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  var bower = gulp.src([
    'app/bower_components/{webcomponentsjs}/**/*'
  ]).pipe(gulp.dest(dist('bower_components')));

  var bower = gulp.src([
    'app/bower_components/uqlibrary-api/mock/**/*'
  ]).pipe(gulp.dest(dist('bower_components/uqlibrary-api/mock')));

  var data = gulp.src([
    'app/bower_components/uqlibrary-api/data/contacts.json'
  ]).pipe(gulp.dest(dist('bower_components/uqlibrary-api/data')));


  return merge(app, bower, data)
      .pipe($.size({
        title: 'copy'
      }));
});

// Copy web fonts to dist
gulp.task('fonts', function() {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest(dist('fonts')))
    .pipe($.size({
      title: 'fonts'
    }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  return optimizeHtmlTask(
    ['app/**/*.html', '!app/{elements,test,bower_components}/**/*.html'],
    dist());
});

// Vulcanize granular configuration
gulp.task('vulcanize', ['clean_bower'], function(cb) {

  var menuJson=fs.readFileSync("app/bower_components/uqlibrary-reusable-components/resources/uql-menu.json", "utf8");
  var regEx = new RegExp("menuJsonFileData;", "g");

  var contactsJson=fs.readFileSync("app/bower_components/uqlibrary-api/data/contacts.json", "utf8");
  var contactsRegEx = new RegExp("contactsJsonFileData;", "g");

  return gulp.src('app/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    // .pipe(plumber())
    .on('error', function (err) {
      process.exit(1);
      // process.emit('exit') // or throw err
    })
    .pipe($.crisper({
      scriptInHead: false,
      onlySplit: false
    }))
    .pipe($.if('*.js',replace({patterns: [{ match: regEx, replacement: menuJson + ';'}], usePrefix: false}))) //replace menu-json with value from resources/uql-menu.json
    .pipe($.if('*.js',replace({patterns: [{ match: contactsRegEx, replacement: contactsJson + ';'}], usePrefix: false}))) //replace contacts.json with value from uqlibrary-api
    .pipe($.if('*.js',$.uglify({preserveComments: 'some'}))) // Minify js output
    .pipe($.if('*.html', $.minifyHtml({quotes: true, empty: true, spare: true}))) // Minify html output
    .pipe(gulp.dest(dist('elements')))
    .pipe($.size({title: 'vulcanize'}))
    // .on('error', function (code, signal) {
    //   if (code) exitCode = code;
    //   done()
    // })
    ;
});

// update paths to bower_components for all components inside bower_components
gulp.task('clean_bower', function() {

  var regEx = new RegExp("bower_components", "g");

  return gulp.src('app/bower_components/**/*.html')
      .pipe(replace({patterns: [{ match: regEx, replacement: ".."}], usePrefix: false}))
      .pipe(gulp.dest('app/bower_components'))
      .pipe($.size({title: 'clean_bower'}));
});

// Clean output directory
gulp.task('clean', function() {
  return del(['.tmp', dist()]);
});

// Watch files for changes & reload
gulp.task('serve', ['clean_bower', 'styles', 'elements'], function() {
  browserSync({
    open: "external",
    host: 'dev-app.library.uq.edu.au',
    port: 9999,
    notify: false,
    logPrefix: 'UQL',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [historyApiFallback()]
    }
  });

  gulp.watch(['app/**/*.html', '!app/bower_components/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.scss'], ['styles', reload]);
  gulp.watch(['app/elements/**/*.css'], ['elements', reload]);
  gulp.watch(['app/scripts/**/*.js'], reload);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    open: "external",
    host: 'dev-app.library.uq.edu.au',
    port: 5001,
    notify: false,
    logPrefix: 'UQL',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: dist(),
    middleware: [historyApiFallback()]
  });
});

// Build production files, the default task
gulp.task('default', ['clean', 'watch'], function(cb) {
  runSequence(
    ['ensureFiles', 'copy', 'styles'],
    'elements',
    ['images', 'fonts', 'html'],
    'vulcanize',
    'inject-browser-update',
    'inject-preloader',
    'inject-ga-values',
    'monkey-patch-paper-input',
    'rev',
    'monkey-patch-rev-manifest',
    'rev-replace-polymer-fix',
    'app-cache-version-update',
    'rev-appcache-update',
    'remove-rev-file',
    cb);
});

// gulp.on('error', function (err) {
//   process.exit(1);
//   process.emit('exit') // or throw err
// });
//
// process.on('exit', function () {
//   process.nextTick(function () {
//     process.exit(exitCode)
//   })
// });

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {}

gulp.task('help', taskList);


// per https://gist.github.com/noahmiller/61699ad1b0a7cc65ae2d
// Command line option:
//  --fatal=[warning|error|off]
var fatalLevel = require('yargs').argv.fatal;

var ERROR_LEVELS = ['error', 'warning'];

// Return true if the given level is equal to or more severe than
// the configured fatality error level.
// If the fatalLevel is 'off', then this will always return false.
// Defaults the fatalLevel to 'error'.
function isFatal(level) {
  return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf(fatalLevel || 'error');
}

// Handle an error based on its severity level.
// Log all levels, and exit the process for fatal levels.
function handleError(level, error) {
  gutil.log(error.message);
  if (isFatal(level)) {
    process.exit(1);
  }
}

// Convenience handler for error-level errors.
function onError(error) { handleError.call(this, 'error', error);}
// Convenience handler for warning-level errors.
function onWarning(error) { handleError.call(this, 'warning', error);}

var testfiles = ['error.js', 'warning.js'];

// Task that emits an error that's treated as a warning.
gulp.task('warning', function() {
  gulp.src(testfiles).
  pipe(jshint()).
  pipe(jshint.reporter('fail')).
  on('error', onWarning);
});

// Task that emits an error that's treated as an error.
gulp.task('error', function() {
  gulp.src(testfiles).
  pipe(jshint()).
  pipe(jshint.reporter('fail')).
  on('error', onError);
});

gulp.task('watch', function() {
  // By default, errors during watch should not be fatal.
  fatalLevel = fatalLevel || 'off';
  gulp.watch(testfiles, ['error']);
});

