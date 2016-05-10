(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($location, $rootScope, $scope, $timeout, AuthService, AUTH_EVENTS, WS_ERROR) {
    var vm = this;

    AuthService.isAuthenticated(function () { $location.path('/').replace() });

    vm.username = '';
    vm.password = '';
    vm.remember = false;
    vm.message = {
      fill: false,
      class: '',
      text: ''
    };
    vm.progress = false;

    vm.auth = function () {
      $scope.login.progress = true;
      $scope.login.message.fill = false;

      var credentials = {
        username: vm.username,
        password: vm.password
      };

      AuthService.login(credentials, vm.remember).then(function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        var query = $location.search();

        if (query.hasOwnProperty('back')) {
          $location.path(query.back).replace();
          delete query.back;
          $location.search(query);
        } else {
          $location.path('/').replace();
        }
      }).catch(function (data) {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        $scope.login.username = $scope.login.password = '';
        $scope.login.progress = false;

        $scope.login.message.fill = true;
        $scope.login.message.class = 'nst-error-msg';

        switch (data.err_code) {
          case WS_ERROR.INVALID:
            $scope.login.message.text = 'Invalid `Username` or `Password`';
            break;

          default:
            $scope.login.message.text = 'An error occurred in login. Please try again later';
            break;
        }

        $timeout(function () {
          $scope.login.message.fill = false;
        }, 5000);
      });
    }
  }
})();
