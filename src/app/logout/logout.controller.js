(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController(AuthService, AUTH_EVENTS, $rootScope, $location) {
    AuthService.logout().then(
      function () {
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        $rootScope.$apply(function () {
          $location.path('/').replace();
        });
      }
    );
  }
})();
