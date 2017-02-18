(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($state, NstSvcAuth) {
    $state.go('public.signin');
    if (NstSvcAuth.isAuthorized()) {
      NstSvcAuth.logout();
    }
  }
})();
