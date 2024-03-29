// Karma configuration
// Generated on Sun Aug 28 2016 16:54:29 GMT+0430 (IRDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // ngHtml2JsPreprocessor: {
    //   stripPrefix: conf.paths.src + '/',
    //   moduleName: 'ronak.nested.web'
    // },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai', 'chai-as-promised', 'chai'],
    // plugins : ['karma-mocha', 'karma-chai-as-promised', 'karma-sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/angular/angular.js',
      'bower_components/lodash/dist/lodash.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'src/app/index.module.js',
      'src/app/index.config.js',
      'src/**/*.module.js',
      'src/**/*.class.js',
      'src/**/*.const.js',
      'src/**/*.service.js',
      'src/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.js': ['coverage']
    },

    // coverageReporter: {
    //   type : 'text-summary',
    //   dir : 'coverage/'
    // },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ['progress', 'coverage'],
    reporters: ['progress'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    browserConsoleLogOptions : {
      level: "log",
      terminal: true
    }
  });
}
