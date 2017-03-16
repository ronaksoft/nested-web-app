(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($state, NstSvcAuth) {
    if (NstSvcAuth.isAuthorized()) {
      NstSvcAuth.logout();
    }
    $state.go('public.signin');
  }
})();
