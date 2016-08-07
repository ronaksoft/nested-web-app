(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($state, NstSvcAuth) {
    if (NstSvcAuth.isAuthorized()) {
      NstSvcAuth.logout().then(function () {
        $state.go('intro');
      });
    } else {
      $state.go('intro');
    }
  }
})();
