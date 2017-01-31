(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .directive('verifyCodeStep', function() {
      return {
        restrict: 'E',
        templateUrl : 'app/public/common/verify-code/verify-code-step.html',
        replace : true,
        controller : 'VerifyCodeStepController',
        controllerAs : 'ctrl',
        bindToController : true,
        scope: {
          verificationId : '=',
          phone : '=',
          onCompleted : '@',
          onPrevious : '@'
        },
      };
    });

})();
