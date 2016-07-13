(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($location, $rootScope,
                            AUTH_EVENTS,
                            NstSvcAuth) {
    NstSvcAuth.logout().then(function () {
      $rootScope.$broadcast(AUTH_EVENTS.UNAUTHORIZE);
      $location.path('/').replace();
    });
  }
})();
