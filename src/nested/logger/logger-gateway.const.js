(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_LOGGER_GATEWAY', {
      BASIC: 'basic',
      CONSOLE: 'console',
      HTTP: 'http'
    });
})();
