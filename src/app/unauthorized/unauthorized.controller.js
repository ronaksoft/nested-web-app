(function() {
  'use strict';

  angular
    .module('nested')
    .controller('UnauthorizedController', UnauthorizedController);

  /** @ngInject */
  function UnauthorizedController($location, $rootScope, $scope, $q, NstSvcAuth) {
    $scope.signout = function () {
      return NstSvcAuth.logout().then(function () {
        $location.path('/').replace();
        $rootScope.modals['unauthorized'].close();

        return $q(function (res) {
          res();
        });
      });
    };
  }
})();
