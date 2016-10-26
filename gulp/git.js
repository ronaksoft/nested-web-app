'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*']
});


function gitVersion(cb) {
  const exec = require('child_process').exec;
  exec('git describe --abbrev=0 --tags', function (err, stdout) {
    gulp.src(conf.paths.relDist + '/**/*.{html,js}')
      .pipe($.replace('__version__', stdout.trim()))
      .pipe(gulp.dest(path.join(conf.paths.relDist, '/')))
      .on('end', cb);
  });
}

function gitCommitCount(cb) {
  const exec = require('child_process').exec;
  return exec('git rev-list --all --count', function (err, stdout) {
    gulp.src(conf.paths.relDist + '/**/*.{html,js}')
      .pipe($.replace('__git_commits__', stdout.trim()))
      .pipe(gulp.dest(path.join(conf.paths.relDist, '/')))
      .on('end', cb);
  });
}

function gitCommitTime(cb) {
  const exec = require('child_process').exec;
  return exec('git log -1 --pretty=format:%ci', function (err, stdout) {
    gulp.src(conf.paths.relDist + '/**/*.{html,js}')
      .pipe($.replace('__git_time__', stdout.trim()))
      .pipe(gulp.dest(path.join(conf.paths.relDist, '/')))
      .on('end', cb);
  });
}

function gitCommitHash(cb) {
  const exec = require('child_process').exec;
  return exec('git rev-parse HEAD', function (err, stdout) {
    gulp.src(conf.paths.relDist + '/**/*.{html,js}')
      .pipe($.replace('__git_hash__', stdout.trim()))
      .pipe(gulp.dest(path.join(conf.paths.relDist, '/')))
      .on('end', cb);
  });
}



gulp.task('git-version', gitVersion);
gulp.task('git-commit-count', gitCommitCount);
gulp.task('git-commit-time', gitCommitTime);
gulp.task('git-commit-hash', gitCommitHash);
gulp.task('git',['git-version','git-commit-count','git-commit-time','git-commit-hash']);
