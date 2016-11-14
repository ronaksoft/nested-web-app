(function () {

  'use strict';
  angular.module('ronak.nested.web.data').constant('NST_SRV_PING_PONG', {
    COMMAND : 'PING!',
    RESPONSE : 'PONG',
    INTERVAL_TIME : 60000,
    INTERVAL_TIMEOUT : 1000,
    MAX_FAILED_PING : 2,
    OBSERVER_INTERVAL_TIME : 5000
  });
})();
