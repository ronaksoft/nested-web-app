(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($window, $state, $stateParams, md5, $location,
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

    /*****************************
     ***** Initialization ****
     *****************************/

    (function () {
      if (NstSvcAuth.isInAuthorization()) {
        goDefaultState();
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
        username: _.toLower(vm.username),
        password: encrypt(vm.password)
      };

      NstSvcAuth.login(credentials, vm.remember).then(function (result) {
        if (hasBackUrl()) {
          goToBackUrl();
        } else {
          goDefaultState();
        }

      }).catch(function (error) {
        vm.password = '';

        vm.message.fill = true;
        vm.message.class = 'nst-error-msg';

        if (error.code === NST_SRV_ERROR.INVALID) {
          vm.message.text = NstSvcTranslation.get('Invalid Username or Password');
        } else if (error.code === NST_SRV_ERROR.ACCESS_DENIED && error.message[0] === 'disabled') {
          vm.message.text = NstSvcTranslation.get('Your account has been disabled! Contact Nested administrator to get more information.');
        } else {
          vm.message.text = NstSvcTranslation.get('An error occurred in login. Please try again later');
        }

      }).finally(function () {
        vm.progress = false;
      });
    };

    /*****************************
     ***** Internal Methods ****
     *****************************/

    function goToBackUrl() {
      var url = $window.decodeURIComponent($stateParams.back);
      $location.url(_.trimStart(url, "#"));
    }

    function hasBackUrl() {
      return !!$stateParams.back;
    }

    function goDefaultState() {
      $state.go(NST_DEFAULT.STATE);
    }

    function encrypt(text) {
      return md5.createHash(text);
    }
  }
})();
