(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($location, $rootScope,
                            NST_AUTH_EVENT,
                            AuthService) {
    AuthService.logout().then(function () {
      $rootScope.$broadcast(NST_AUTH_EVENT.UNAUTHORIZE);
      $location.path('/').replace();
    });
  }
})();
