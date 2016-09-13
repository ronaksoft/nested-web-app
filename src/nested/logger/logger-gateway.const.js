(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.log')
    .constant('NST_LOGGER_GATEWAY', {
      BASIC: 'basic',
      CONSOLE: 'console',
      HTTP: 'http'
    });
})();
