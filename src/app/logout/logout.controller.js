(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($location, $rootScope,
                            NST_AUTH_EVENT,
                            NstSvcAuth) {
    NstSvcAuth.logout().then(function () {
      $rootScope.$broadcast(NST_AUTH_EVENT.UNAUTHORIZE);
      $location.path('/').replace();
    });
  }
})();
