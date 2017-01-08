(function () {

  'use strict';
  angular.module('ronak.nested.web.data').constant('NST_SRV_ERROR', {
    UNAUTHORIZED: -1,
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
