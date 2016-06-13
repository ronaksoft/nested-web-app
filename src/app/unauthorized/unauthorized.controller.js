(function() {
  'use strict';

  angular
    .module('nested')
    .controller('UnauthorizedController', UnauthorizedController);

  /** @ngInject */
  function UnauthorizedController($location, $rootScope, $scope, $q, AuthService) {
    $scope.signout = function () {
      return AuthService.logout().then(function () {
        $location.path('/').replace();
        $rootScope.modals['unauthorized'].close();

        return $q(function (res) {
          res();
        });
      });
    };
  }
})();
