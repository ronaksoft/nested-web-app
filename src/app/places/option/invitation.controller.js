(function() {
  'use strict';

  angular
    .module('nested')
    .controller('InvitationController', function ($scope, $uibModalInstance){
      $scope.accept = function () {
        decideInvite(invitaion, true);
        $uibModalInstance.close();
      };

      $scope.decline = function () {
        decideInvite(invitaion, false);
        $uibModalInstance.dismiss();
      };
      $scope.cansel = function () {
        $uibModalInstance.dismiss();
      };
    })

})();
