(function () {

  'use strict';
  angular.module('ronak.nested.web.data').constant('NST_SRV_PING_PONG', {
    COMMAND : 'nop',
    INTERVAL_TIME : 59000,
    INTERVAL_TIMEOUT : 59000,
    MAX_FAILED_PING : 2
  });
})();
