(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($location, $rootScope,
                            NST_AUTH_EVENTS,
                            NstSvcAuth) {
    NstSvcAuth.logout().then(function () {
      $rootScope.$broadcast(NST_AUTH_EVENTS.UNAUTHORIZE);
      $location.path('/').replace();
    });
  }
})();
