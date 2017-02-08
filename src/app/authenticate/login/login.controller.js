(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($q, $window, $rootScope, $state, $stateParams, md5,
                           NST_DEFAULT, NST_SRV_ERROR,
                           NstSvcAuth) {
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

    (function () {
      if (NstSvcAuth.isInAuthorization()) {
        $state.go(NST_DEFAULT.STATE);
        return;
      }
    })();

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.auth = function () {
      vm.progress = true;
      vm.message.fill = false;

      var credentials = {
        username: vm.username.toLowerCase(),
        password: md5.createHash(vm.password)
      };

      NstSvcAuth.login(credentials, vm.remember).then(function () {
        return $q(function (res) {
          var state = {
            name: NST_DEFAULT.STATE
          };

          if ($stateParams.back) {
            var desState = angular.fromJson($window.decodeURIComponent($stateParams.back));
            if (desState.name && $state.get(desState.name)) {
              state.name = desState.name;
              state.params = desState.params || undefined;
            }
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


      });
    };
  }
})();
