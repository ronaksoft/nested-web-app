(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.validation')
    .directive('matchTo', matchTo);

  function matchTo() {
    return {
      require: 'ngModel',
      scope: {
        originalValue: '=matchTo'
      },
      link: function(scope, element, attributes, ngModel) {
        ngModel.$validators.matchTo = function(modelValue) {
          return modelValue === scope.originalValue;
        };

        scope.$watch("originalValue", function() {
          ngModel.$validate();
        });
      }
    };
  }

})();
