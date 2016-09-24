(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ResetPasswordController', ResetPasswordController);

  /** @ngInject */
  function ResetPasswordController(NstSvcAuth, $location) {
    var vm = this;

    vm.msg = {
      text: "Enter your username"
    };

    vm.butn = {
      text: "Check"
    };
  }
})();
