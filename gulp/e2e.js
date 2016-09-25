var gulp = require('gulp');
var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var selenium = require('selenium-standalone');
var webdriver = require('gulp-webdriver');
var httpServer, seleniumServer;

gulp.task('http', function (done) {
  var app = connect().use(serveStatic('test/fixtures'));
  httpServer = http.createServer(app).listen(9000, function () {
    done();
  });
});

gulp.task('selenium', ['http'] ,function (done) {
  // selenium.install({logger: console.log}, function () {

    selenium.start(function (err, child) {
      if (err) {
        return done(err);
      }
      seleniumServer = child;
      done();
    });
  // });
});

gulp.task('e2e2', [ 'selenium'], function () {

  gulp.src('../wdio.consf.js')
    .pipe(webdriver()).on('error', function (err) {
      console.log(err)

      seleniumServer.kill();
      process.exit(1);
      done();
    })
  done();
});

gulp.task('bdd', ['e2e2'], function () {
  httpServer.close();
  seleniumServer.kill();
});
