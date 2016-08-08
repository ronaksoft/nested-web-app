(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($q, $window, $timeout, $state, md5,
                           NST_DEFAULT, NST_SRV_ERROR,
                           NstSvcLoader, NstSvcAuth) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.username = '';
    vm.password = '';
    vm.remember = false;
    vm.message = {
      fill: false,
      class: '',
      text: ''
    };
    vm.progress = false;

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.auth = function () {
      vm.progress = true;
      vm.message.fill = false;

      var credentials = {
        username: vm.username,
        password: md5.createHash(vm.password)
      };

      NstSvcLoader.inject(NstSvcAuth.login(credentials, vm.remember).then(function () {
        return $q(function (res) {
          var state = {
            name: NST_DEFAULT.STATE
          };
          if ($state.params.back) {
            state = angular.fromJson($window.decodeURIComponent($state.params.back));
          }

          res();
          $state.go(state.name, state.params);
        });
      }).catch(function (error) {
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
    };
  }
})();
