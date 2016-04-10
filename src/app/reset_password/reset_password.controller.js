(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ResetPasswordController', ResetPasswordController);

  /** @ngInject */
  function ResetPasswordController() {
    var vm = this;

    vm.msg = {
      text: "Enter your username"
    };

    vm.btn = {
      text: "Check"
    };
  }
})();
