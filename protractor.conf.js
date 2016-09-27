'use strict';

var paths = require('./.yo-rc.json')['generator-gulp-angular'].props.paths;

// An example configuration file.
exports.config = {
  // The address of a running selenium server.
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  //seleniumServerJar: deprecated, this should be set on node_modules/protractor/config.json

  framework: 'custom',
  // path relative to the current config file
  frameworkPath: require.resolve('protractor-cucumber-framework'),

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:3000/#',

  // Spec patterns are relative to the current working directory when
  // protractor is called.
  specs: ['../e2e/features/**/*.feature'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  allScriptsTimeout: 500000, //This is the overall Timeout
  getPageTimeout: 500000, //This is the Page timeout

  cucumberOpts: {
    require: ['./e2e/steps/**/*.js'],
    tags: false,
    format: 'pretty',
    profile: false,
    'no-source': true
  }
};
