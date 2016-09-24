(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($state, NstSvcAuth, NST_CONFIG) {
    if (NstSvcAuth.isAuthorized()) {
      NstSvcAuth.logout().then(function () {
        location.href = NST_CONFIG.SIGN_OUT_TARGET;
      });
    } else {
      location.href = NST_CONFIG.SIGN_OUT_TARGET;
    }
  }
})();
