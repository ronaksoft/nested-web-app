(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .directive('registerStep', function() {
      return {
        restrict: 'E',
        templateUrl : 'app/public/register/step/register-step.html',
        replace : true,
        scope: {
          verificationId : '=',
          phone : '=',
          onCompleted : '@',
          countryCode : '='
        },
        controller : 'RegisterStepController',
        controllerAs : 'ctrl',
        bindToController : true,
      };
    });

})();
