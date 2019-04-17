(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_AUTH_EVENT', {
      UNAUTHORIZE: 'auth-unauthorize',
      AUTHORIZE: 'auth-authorize',
      AUTHORIZE_FAIL: 'auth-authorize-fail',
      CHANGE_PASSWORD: 'auth-change-password',
      SESSION_EXPIRE: 'auth-session-expire'
    });
})();
