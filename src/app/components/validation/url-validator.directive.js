(function() {
    'use strict';
  
    angular
      .module('ronak.nested.web.components')
      .directive('urlValidator', urlValidator);
  
    /** @ngInject */
    function urlValidator() {
      return {
        require: 'ngModel',
        link: function(scope, element, attr, mCtrl) {
          function myValidation(value) {
            if (value.indexOf("http") > -1) {
              mCtrl.$setValidity('url', true);
            } else {
              mCtrl.$setValidity('url', false);
            }
            return value;
          }
          mCtrl.$parsers.push(myValidation);
        }
      };
    }
  
  })();
  