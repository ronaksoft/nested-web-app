(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.log')
    .constant('NST_LOG_TYPE', {
      DEBUG: 'debug',
      INFO: 'info',
      ERROR: 'error',
      WARNING: 'warning'
    });
})();
