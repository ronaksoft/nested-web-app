(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .directive('submitPhoneStep', function() {
      return {
        restrict: 'E',
        templateUrl : 'app/public/common/submit-phone/submit-phone-step.html',
        replace : true,
        controller : 'SubmitPhoneStepController',
        controllerAs : 'ctrl',
        bindToController : true,
        scope: {
          phone : '=',
          countryCode : '=',
          onCompleted : '@',
          checkPhoneAvailable : '@',
          instantSubmit : '='
        },
      };
    });

})();
