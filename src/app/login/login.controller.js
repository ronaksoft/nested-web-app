(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($window, $location, $rootScope, $scope, $q, $timeout,
                           AuthService, AUTH_EVENTS, WS_ERROR, LoaderService) {
    var vm = this;

    if (AuthService.isAuthenticated()) {
      $location.path('/').replace();
    }

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

      LoaderService.inject(AuthService.login(credentials, vm.remember).then(function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        var query = $location.search();

        var back = query.back || '/';
        if (query.back) {
          delete query.back;
          $location.search(query);
        }

        return $q(function (res) {
          res();
          $location.path(back).replace();
        });
      }).catch(function (data) {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        $scope.login.username = $scope.login.password = '';
        $scope.login.progress = false;

        $scope.login.message.fill = true;
        $scope.login.message.class = 'nst-error-msg';

        switch (data.err_code) {
          case WS_ERROR.INVALID:
            $scope.login.message.text = 'Invalid Username or Password';
            break;

          default:
            $scope.login.message.text = 'An error occurred in login. Please try again later';
            break;
        }

        $timeout(function () {
          $scope.login.message.fill = false;
        }, 5000);
      }));
    }
  }
})();
