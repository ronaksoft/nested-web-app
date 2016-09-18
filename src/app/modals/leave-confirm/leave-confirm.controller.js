(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('LeaveConfirmController', LeaveConfirmController);

  function LeaveConfirmController($uibModalInstance,$uibModalStack) {
    var vm = this;

    vm.ok = function () {
      $uibModalInstance.close();
    };

    vm.cancel = function () {
      $uibModalStack.dismissAll();
    };
  }
})();
