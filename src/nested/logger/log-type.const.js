(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_LOG_TYPE', {
      DEBUG: 'debug',
      INFO: 'info',
      ERROR: 'error',
      WARNING: 'warning'
    });
})();
