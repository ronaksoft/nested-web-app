(function() {
    'use strict';
  
    angular
      .module('ronak.nested.web.components')
      .directive('placeValidator', placeValidator);
  
    /** @ngInject */
    function placeValidator(NstSvcPlaceFactory) {
      return {
        require: 'ngModel',
        link: function(scope, element, attr, mCtrl) {
          function myValidation(value) {
            NstSvcPlaceFactory.get(value)
              .then(function (place) {
                if (place.accesses.indexOf("C") > -1) {
                  mCtrl.$setValidity('place', true);
                } else {
                  mCtrl.$setValidity('place', false);
                }
              }).catch(function (error) {
                mCtrl.$setValidity('place', false);
              });
            return value;
          }
          mCtrl.$parsers.push(myValidation);
        }
      };
    }
  
  })();
  