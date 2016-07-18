(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($location, $rootScope, $scope, $q, $timeout,
                           NstSvcAuth, NST_AUTH_EVENT, NST_SRV_ERROR,
                           NstSvcLoader) {
    var vm = this;

    if (NstSvcAuth.isAuthorized()) {
      $location.path('/messages').replace();
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
      vm.progress = true;
      vm.message.fill = false;

      var credentials = {
        username: vm.username,
        password: vm.password
      };

      NstSvcLoader.inject(NstSvcAuth.login(credentials, vm.remember).then(function () {
        $rootScope.$broadcast(NST_AUTH_EVENT.loginSuccess);
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
      }).catch(function (error) {
        $rootScope.$broadcast(NST_AUTH_EVENT.loginFailed);
        vm.username = vm.password = '';
        vm.progress = false;

        vm.message.fill = true;
        vm.message.class = 'nst-error-msg';

        switch (error.getCode()) {
          case NST_SRV_ERROR.INVALID:
            vm.message.text = 'Invalid Username or Password';
            break;

          default:
            vm.message.text = 'An error occurred in login. Please try again later';
            break;
        }

        $timeout(function () {
          vm.message.fill = false;
        }, 5000);
      }));
    }
  }
})();
