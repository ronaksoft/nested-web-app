(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_AUTH_STATE', {
      UNAUTHORIZED: 'unauthorized',
      AUTHORIZING: 'authorizing',
      AUTHORIZED: 'authorized'
    })
    .constant('NST_AUTH_EVENTS', {
      UNAUTHORIZE: 'unauthorize',
      AUTHORIZE: 'authorize',
      AUTHORIZE_FAIL: 'authorize-fail'
    })
    .constant('NST_UNREGISTER_REASON', {
      LOGOUT: 'logout',
      AUTH_FAIL: 'authorization_fail',
      DISCONNECT: 'disconnect'
    })
})();
