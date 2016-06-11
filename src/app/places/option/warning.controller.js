(function() {
  'use strict';

  angular
    .module('nested')
    .controller('WarningController', function ($scope,$uibModalInstance){
      $scope.ok = function () {
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    })

})();
