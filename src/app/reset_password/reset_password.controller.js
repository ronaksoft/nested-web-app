(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ResetPasswordController', ResetPasswordController);

  /** @ngInject */
  function ResetPasswordController(AuthService, $location) {
    var vm = this;

    AuthService.isAuthenticated(function () { $location.path('/').replace() });

    vm.msg = {
      text: "Enter your username"
    };

    vm.btn = {
      text: "Check"
    };
  }
})();
