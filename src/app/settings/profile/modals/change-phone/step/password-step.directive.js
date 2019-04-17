(function() {
  'use strict';
  angular
    .module('ronak.nested.web.settings')
    .directive('passwordStep', function() {
      return {
        restrict: 'E',
        templateUrl : 'app/settings/profile/modals/change-phone/step/password-step.html',
        replace : true,
        scope: {
          verificationId : '=',
          phone : '=',
          onCompleted : '@',
          countryCode : '='
        },
        controller : 'PasswordStepController',
        controllerAs : 'ctrl',
        bindToController : true
      };
    });

})();
