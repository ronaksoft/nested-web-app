(function() {
  'use strict';

  angular
    .module('nested')
    .controller('Navigation_Controller', Navigation_barController);

  /** @ngInject */
  function Navigation_barController($scope, $rootScope, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
      username: '',
      password: ''
    };

    $scope.navbar = function (credentials) {
      AuthService.navbar(credentials).then(
        function () {
          // $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        },
        function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        }
      );
    };
  }
})();
