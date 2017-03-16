(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.validation')
    .directive('range', range);

  function range() {
    return {
      require: 'ngModel',
      link: function(scope, element, attributes, ngModel) {
        var min = null,
            max = null;
            
        if (_.has(attributes, 'range')) {
          min = Number(_.split(attributes.range, "-")[0]);
          max = Number(_.split(attributes.range, "-")[1]);
        }

        ngModel.$validators.matchTo = function(modelValue) {
          if (max && min) {
            var value = Number(modelValue);
            return value >= min && value <= max;
          }

          return true;
        };
      }
    };
  }

})();
