(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController(AuthService, AUTH_EVENTS, $rootScope, $location) {
    var vm = this;

    AuthService.isAuthenticated(function () { $location.path('/').replace() });

    vm.username = '';
    vm.password = '';
    vm.remember = false;

    vm.auth = function () {
      var credentials = {
        username: vm.username,
        password: vm.password
      };

      AuthService.login(credentials, vm.remember).then(
        function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          $rootScope.$apply(function () {
            var query = $location.search();

            if (query.hasOwnProperty('back')) {
              $location.path(query.back);
              delete query.back;
              $location.search(query);
            } else {
              $location.path('/');
            }
          });
        },
        function (data) {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        }
      );
    }
  }
})();
