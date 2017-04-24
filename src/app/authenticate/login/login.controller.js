(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($q, $window, $rootScope, $state, $stateParams, md5, $location,
                           NST_DEFAULT, NST_SRV_ERROR,
                           NstSvcAuth, NstSvcTranslation) {
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

    vm.auth = function (isValid) {
      if (!isValid) {
        return;
      }

      vm.progress = true;
      vm.message.fill = false;

      var credentials = {
        username: vm.username.toLowerCase(),
        password: md5.createHash(vm.password)
      };

      NstSvcAuth.login(credentials, vm.remember).then(function (result) {
        if ($stateParams.back) {
          var url = $window.decodeURIComponent($stateParams.back);
          $location.url(_.trimStart(url,"#"));
        } else {
          $state.go(NST_DEFAULT.STATE);
        }

      }).catch(function (error) {
        vm.password = '';
        vm.progress = false;

        vm.message.fill = true;
        vm.message.class = 'nst-error-msg';

        switch (error.getCode()) {
          case NST_SRV_ERROR.INVALID:
            vm.message.text = NstSvcTranslation.get('Invalid Username or Password');
            break;

          default:
            vm.message.text = NstSvcTranslation.get('An error occurred in login. Please try again later');
            break;
        }


      });
    };
  }
})();
