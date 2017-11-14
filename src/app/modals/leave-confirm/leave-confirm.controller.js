(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('LeaveConfirmController', LeaveConfirmController);

  function LeaveConfirmController($scope, $uibModalInstance, $uibModalStack) {
    var vm = this;

    vm.ok = function () {
      $scope.$close();
    };

    vm.cancel = function () {
      // $uibModalStack.dismissAll();
      $scope.$dismiss();
    };
  }
})();
