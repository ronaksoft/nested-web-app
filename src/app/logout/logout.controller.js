(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($state, NstSvcAuth) {
    NstSvcAuth.logout().then(function () {
      $state.go('intro').replace();
    });
  }
})();
