(function() {
  'use strict';

  angular
    .module('nested')
    .controller('WarnModalController', function ($scope,$uibModalInstance){
      $scope.ok = function () {
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    })

})();
