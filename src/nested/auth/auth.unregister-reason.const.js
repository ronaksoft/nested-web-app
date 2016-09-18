(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_UNREGISTER_REASON', {
      LOGOUT: 'logout',
      AUTH_FAIL: 'authorization_fail',
      DISCONNECT: 'disconnect'
    });

})();
