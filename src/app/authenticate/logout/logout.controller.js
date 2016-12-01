(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($state, NstSvcAuth, NST_CONFIG) {
    if (NstSvcAuth.isAuthorized()) {
      NstSvcAuth.logout().then(function () {
        $state.go('public.signin');
        //location.href = NST_CONFIG.SIGN_OUT_TARGET;
      });
    } else {
      $state.go('public.signin');
      //location.href = NST_CONFIG.SIGN_OUT_TARGET;
    }
  }
})();
