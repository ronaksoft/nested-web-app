(function() {
  'use strict';

  angular
    .module('nested')
    .controller('LeaveConfirmController', LeaveConfirmController);

  function LeaveConfirmController($uibModalInstance) {
    var vm = this;

    vm.ok = function () {
      $uibModalInstance.close();
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss();
    };
  }
})();
