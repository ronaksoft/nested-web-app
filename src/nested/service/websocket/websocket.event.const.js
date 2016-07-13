(function () {

  'use strict';
  angular.module('nested').constant('NST_WS_EVENT', {
    MESSAGE: '__message',
    INITIALIZE: '__initialize',
    AUTHORIZE: '__authorize',
    MANUAL_AUTH: '__mauthorize',
    UNINITIALIZE: '__uninitialize',
    ERROR: '__error',
    TIMELINE: '__timeline'
  });

})();
