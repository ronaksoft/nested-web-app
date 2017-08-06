'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();


gulp.task('scripts-reload', function() {
  return buildScripts()
    .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
  return buildScripts();
});

function buildScripts() {
  var config = gulp.src([
    path.join(conf.paths.conf, '/*.json')
  ]).pipe(
    $.ngConfig('ronak.nested.web.config')
  ).pipe(
    $.replace('{{BUILD}}', '3.0.0-alpha')
  ).pipe(
    gulp.dest(path.join(conf.paths.tmp, '/serve/config'))
  );

  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.js'),
    path.join(conf.paths.src, '/nested/**/*.js'),
    path.join(conf.paths.tmp, '/serve/config/*.js')
  ]).pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.size());
}
