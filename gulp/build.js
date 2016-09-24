'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.html'),
    path.join(conf.paths.tmp, '/serve/app/**/*.html')
  ])
    .pipe($.htmlmin({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'nested',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), {read: false});
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html', {restore: true});
  var notIndexFilter = $.filter(['**/*', '!**/index.html'], {restore: true});
  var jsFilter = $.filter('**/*.js', {restore: true});
  var cssFilter = $.filter('**/*.css', {restore: true});

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe($.useref()) // Build CSS and Javascript files using build blocks in index.html
    .pipe(jsFilter) // Begin - Javascript Files
    .pipe($.sourcemaps.init())
    .pipe($.ngAnnotate())
    .pipe($.replace('./../bower_components/emojione/assets/sprites/emojione.sprites.svg', '../assets/fonts/emojione.sprites.svg')) //replace emoji svg path
    .pipe($.uglify({mangle: true, preserveComments: $.uglifySaveLicense})).on('error', conf.errorHandler('Uglify'))
    // TODO: The Obfuscator
    .pipe($.minify())
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore) // End - Javascript Files
    .pipe(cssFilter) // Begin - CSS Files
    // .pipe($.sourcemaps.init()) // Do not need sourcemap while using clean-css
    .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../assets/fonts/'))
    .pipe($.replace('../../bower_components/font-awesome/fonts/', '../assets/fonts/'))
    .pipe($.cleanCss({compatibility: 'ie8'}))
    // .pipe($.sourcemaps.write('maps')) // Do not need sourcemap while using clean-css
    .pipe(cssFilter.restore) // End - CSS Files
    .pipe(notIndexFilter) // Exclude index.html
    .pipe($.rev()) // Rename Files
    .pipe(notIndexFilter.restore) // End Exclude index.html
    .pipe(htmlFilter) // Begin - HTML Files
    .pipe($.htmlmin({
      collapseWhitespace: true,
      // Options for html-minify
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore) // End - HTML Files
    .pipe($.revReplace()) // Refactor Occurrences renamed of Files
    .pipe(gulp.dest(path.join(conf.paths.relDist, '/')))
    .pipe($.size({title: path.join(conf.paths.relDist, '/'), showFiles: true}));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.relDist, '/assets/fonts/')));
});

gulp.task('other', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.relDist, '/')));
});

gulp.task('clean', function () {
  return $.del([path.join(conf.paths.dist, '/*'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('build', ['html', 'fonts', 'other']);
