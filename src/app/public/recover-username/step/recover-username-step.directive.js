(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .directive('recoverUsernameStep', function() {
      return {
        restrict: 'E',
        templateUrl : 'app/public/recover-username/step/recover-username-step.html',
        replace : true,
        scope: {
          verificationId : '=',
          phone : '=',
          onCompleted : '@'
        },
        controller : 'RecoverUsernameStepController',
        controllerAs : 'ctrl',
        bindToController : true,
      };
    });

})();
