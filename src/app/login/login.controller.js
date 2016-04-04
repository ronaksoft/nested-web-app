(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($scope, $rootScope, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
      username: '',
      password: ''
    };

    $scope.login = function (credentials) {
      AuthService.login(credentials).then(
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
