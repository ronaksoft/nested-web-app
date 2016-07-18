(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_UNREGISTER_REASON', {
      LOGOUT: 'logout',
      AUTH_FAIL: 'authorization_fail',
      DISCONNECT: 'disconnect'
    });

})();
