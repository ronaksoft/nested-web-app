(function () {

  'use strict';
  angular.module('nested').constant('NST_WS_ERROR', {
    UNKNOWN: 0,
    ACCESS_DENIED: 1,
    UNAVAILABLE: 2,
    INVALID: 3,
    INCOMPLETE: 4,
    DUPLICATE: 5,
    LIMIT_REACHED: 6,
    TIMEOUT: 1000
  });

})();
