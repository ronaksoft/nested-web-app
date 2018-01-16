'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');

gulp.task('styles-reload', ['styles'], function() {
  return buildStyles(true)
    .pipe(browserSync.stream());
});

gulp.task('styles', function() {
  buildTinyMceStyle();
  return buildStyles(true);
});

var buildStyles = function(dark) {
  var sassOptions = {
    style: 'expanded'
  };

  // var files = [];
  // if (dark === true) {
  //   files.push(path.join(conf.paths.src, '/theme/dark-vars.scss'));
  // } else {
  //   files.push(path.join(conf.paths.src, '/theme/vars.scss'));
  // }
  //
  // files.push.apply(files, );

  var injectFiles = gulp.src([
    path.join(conf.paths.src, '/stylesheets/**/*.scss'),
    path.join(conf.paths.src, '/app/**/*.scss'),
    path.join('!' + conf.paths.src, '/app/index.scss')
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(conf.paths.src + '/app/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };


  // var dist;
  // if (dark === true) {
  //   dist = path.join(conf.paths.src, '/app/dark-index.scss');
  // } else {
  //   dist = path.join(conf.paths.src, '/app/index.scss');
  // }

  return gulp.src([
    path.join(conf.paths.src, '/app/index.scss')
  ])
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sourcemaps.init())
    .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
};
var buildTinyMceStyle = function() {

  return gulp.src((['src/stylesheets/partials/tinymce.css']))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
};
