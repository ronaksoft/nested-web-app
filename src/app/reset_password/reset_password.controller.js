(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ResetPasswordController', ['$scope', ResetPasswordController]);

  /** @ngInject */
  function ResetPasswordController($scope) {
    $scope.msg = {
      text: "Enter your username"
    };

    $scope.btn = {
      text: "Check"
    };
  }
})();
