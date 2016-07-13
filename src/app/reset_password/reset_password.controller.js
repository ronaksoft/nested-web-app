(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ResetPasswordController', ResetPasswordController);

  /** @ngInject */
  function ResetPasswordController(NstSvcAuth, $location) {
    var vm = this;

    if (NstSvcAuth.isInAuthorization()) {
      $location.path('/').replace();
    }

    vm.msg = {
      text: "Enter your username"
    };

    vm.btn = {
      text: "Check"
    };
  }
})();
