/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

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
var cloudfront = require('gulp-invalidate-cloudfront');
var replace = require('gulp-replace-task');
var taskList = require('gulp-task-listing');
var argv = require('yargs').argv;


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
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe($.minifyCss())
    .pipe(gulp.dest(dist(stylesPath)))
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
  var assets = $.useref.assets({
    searchPath: ['.tmp', 'app']
  });

  return gulp.src(src)
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    .pipe(assets.restore())
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
  return styleTask('styles', ['**/*.css']);
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
    '!app/cache-config.json',
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

  return merge(app, bower)
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
gulp.task('vulcanize', ['vulcanize:clean_bower'], function() {

  var menuJson=fs.readFileSync("app/bower_components/uqlibrary-reusable-components/resources/uql-menu.json", "utf8");
  var regEx = new RegExp("menuJsonFileData;", "g");

  return gulp.src('app/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe($.crisper({
      scriptInHead: false,
      onlySplit: false
    }))
    .pipe($.if('*.js',replace({patterns: [{ match: regEx, replacement: menuJson + ';'}], usePrefix: false}))) //replace menu-json with value from resources/uql-menu.json
    .pipe($.if('*.js',$.uglify({preserveComments: 'some'}))) // Minify js output
    .pipe($.if('*.html', $.minifyHtml({quotes: true, empty: true, spare: true}))) // Minify html output
    .pipe(gulp.dest(dist('elements')))
    .pipe($.size({title: 'vulcanize'}));
});

// Clean elements.html from bower_components, all required elements should be defined in elements/elements.html
// and do not rely on bower_components/element-x/elements.html
gulp.task('vulcanize:clean_bower', function() {

   return del(['app/bower_components/**/**/elements.html']).then(paths => {

      //console.log('Deleted files and folders:\n', paths.join('\n'));

      //create an empty file?
      for(var i=0; i < paths.length; i++)
      {
        var path = paths[i];
        console.log(path);
        fs.writeFile(path, '', function(){});
      }

  });
});

// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', function(callback) {
  var dir = dist();
  var config = {
    cacheId: packageJson.name || path.basename(__dirname),
    disabled: false
  };

  glob([
    'index.html',
    './',
    'bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '{elements,scripts,styles}/**/*.*'],
    {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache));
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

// Clean output directory
gulp.task('clean', function() {
  return del(['.tmp', dist()]);
});

// Watch files for changes & reload
gulp.task('serve', ['styles', 'elements'], function() {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
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
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/elements/**/*.css'], ['elements', reload]);
  gulp.watch(['app/scripts/**/*.js'], reload);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'PSK',
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
gulp.task('default', ['clean'], function(cb) {
  // Uncomment 'cache-config' if you are going to use service workers.
  runSequence(
    ['ensureFiles', 'copy', 'styles'],
    'elements',
    ['images', 'fonts', 'html'],
    'vulcanize',
    'app-cache-version-update', // 'cache-config',
    cb);
});

// Build then deploy to GitHub pages gh-pages branch
gulp.task('build-deploy-gh-pages', function(cb) {
  runSequence(
    'default',
    'deploy-gh-pages',
    cb);
});

// Deploy to GitHub pages gh-pages branch
gulp.task('deploy-gh-pages', function() {
  return gulp.src(dist('**/*'))
    // Check if running task from Travis CI, if so run using GH_TOKEN
    // otherwise run using ghPages defaults.
    .pipe($.if(process.env.TRAVIS === 'true', $.ghPages({
      remoteUrl: 'https://$GH_TOKEN@github.com/uqlibrary-pages/uqlibrary-pages.git',
      silent: true,
      branch: 'gh-pages'
    }), $.ghPages()));
});

// Update application cache manifest version
// use only for deployment
gulp.task('app-cache-version-update', function() {

  var regEx = new RegExp("<VERSION>", "g");
  var timeStamp = new Date();

  return gulp.src(dist('**/*.appcache'))
      .pipe(replace({patterns: [{ match: regEx, replacement: timeStamp.getTime()}], usePrefix: false}))
      .pipe(gulp.dest(dist()));
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {}

gulp.task('help', taskList);

/**
 * Command line param:
 *    --path {INVALIDATION_PATH}
 *
 * If no bucket path passed will invalidate production subdir
 */
gulp.task('invalidate', function () {
  var awsConfig = JSON.parse(fs.readFileSync('./aws.json'));

  var invalidatePath = '';

  if (argv.path) {
    invalidatePath = argv.path + '/*';
  } else {
    invalidatePath += '/pages/*';
  }

  $.util.log('Invalidation path: ' + invalidatePath);

  var invalidationBatch = {
    CallerReference: new Date().toString(),
    Paths: {
      Quantity: 1,
      Items: [
        invalidatePath
      ]
    }
  };

  var awsSettings = {
    credentials: {
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey
    },
    distributionId: awsConfig.params.distribution,
    region: awsConfig.params.region
  };

  return gulp.src(['**/*'])
      .pipe(cloudfront(invalidationBatch, awsSettings));
});

// upload package to S3
gulp.task('publish', function () {

  // create a new publisher using S3 options
  var awsConfig = JSON.parse(fs.readFileSync('./aws.json'));
  var publisher = $.awspublish.create(awsConfig);

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src(dist('**/*'))
      .pipe($.rename(function (path) {
        path.dirname = awsConfig.params.bucketSubDir + '/' + path.dirname;
      }))
      // gzip, Set Content-Encoding headers
      .pipe($.awspublish.gzip())

      // publisher will add Content-Length, Content-Type and headers specified above
      // If not specified it will set x-amz-acl to public-read by default
      .pipe(publisher.publish(headers))

      // create a cache file to speed up consecutive uploads
      .pipe(publisher.cache())

      // print upload updates to console
      .pipe($.awspublish.reporter());
});