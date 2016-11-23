(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.validation')
    .directive('allowOnlyNumber', allowOnlyNumber);

  function allowOnlyNumber() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelController) {

        modelController.$parsers.push(function(value) {

          var clearedValue = _.replace(value, /[^0-9]/g, '');

          if (clearedValue !== value) {
            modelController.$setViewValue(clearedValue);
            modelController.$render();
          }

          return clearedValue;
        });
      }
    };
  }

})();
