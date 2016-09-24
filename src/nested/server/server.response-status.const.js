(function () {

  'use strict';
  angular.module('nested').constant('NST_SRV_RESPONSE_STATUS', {
    UNDEFINED: 'not defined',
    SUCCESS: 'ok',
    ERROR: 'err',
    FATAL_ERROR: 'fatal error',
    WARNING: 'warning',
    NOTICE: 'notice'
  });
})();
