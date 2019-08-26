/*
 * deployment tasks
 *
 * contains tasks for AWS S3 invalidation and publishing
 *
 * */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var cloudfront = require('gulp-invalidate-cloudfront');

var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;

var DIST = 'dist';
var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

/**
 * usage:
 *  gulp invalidate --path {INVALIDATION_PATH}
 *
 * If no bucket folder-path passed, it will invalidate the production subdirectory
 */
gulp.task('invalidate', function () {
  var awsConfig = JSON.parse(fs.readFileSync('./aws.json', 'utf8'));

  var invalidatePath = '';

  if (!!argv.path) {
    invalidatePath = argv.path + '/*';
  } else {
    invalidatePath = '/pages/*';
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
  var awsConfig = JSON.parse(fs.readFileSync('./aws.json', 'utf8'));
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
