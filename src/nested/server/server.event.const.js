(function () {

  'use strict';
  angular.module('ronak.nested.web.data').constant('NST_SRV_EVENT', {
    MESSAGE: '__message',
    INITIALIZE: '__initialize',
    AUTHORIZE: '__authorize',
    MANUAL_AUTH: '__mauthorize',
    UNINITIALIZE: '__uninitialize',
    ERROR: '__error',
    TIMELINE: '__timeline',
    DISCONNECT: 'DISCONNECT',
    CONNECT: 'CONNECT'
  });
})();
