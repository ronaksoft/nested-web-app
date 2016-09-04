(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ResetPasswordController', ResetPasswordController);

  /** @ngInject */
  function ResetPasswordController() {
    var vm = this;

    vm.step1 = true;
    vm.step2 = false;
    vm.step3 = false;

    vm.submitNumber = function () {
      vm.step1 = false;
      vm.step2 = true;
    };

    vm.submitCode = function () {
      vm.step2 = false;
      vm.step3 = true;
    };
    
    vm.resetPass = function () {
    }

  }
})();
