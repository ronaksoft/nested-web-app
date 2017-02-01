(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .directive('recoverPasswordStep', function() {
      return {
        restrict: 'E',
        templateUrl : 'app/public/recover-password/step/recover-password-step.html',
        replace : true,
        scope: {
          verificationId : '=',
          phone : '=',
          onCompleted : '@'
        },
        controller : 'RecoverPasswordStepController',
        controllerAs : 'ctrl',
        bindToController : true,
      };
    });

})();
