(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($location, $rootScope, AuthService, AUTH_EVENTS) {
    AuthService.logout().then(function () {
      $rootScope.$broadcast(AUTH_EVENTS.UNAUTHENTICATE);
      $location.path('/').replace();
    });
  }
})();
