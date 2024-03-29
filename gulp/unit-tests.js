'use strict';

var gulp = require('gulp');
var Server = require('karma').Server;


gulp.task('test', function (done) {

  new Server({
    configFile : __dirname + '/../karma.conf.js',
    singleRun : true
  }, done).start();

});

gulp.task('test-dev', function (done) {

  new Server({
    configFile : __dirname + '/../karma.conf.js',
  }, done).start();

});
