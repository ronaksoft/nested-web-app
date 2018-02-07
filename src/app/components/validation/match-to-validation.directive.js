(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.validation')
    .directive('matchTo', matchTo);

  function matchTo(_) {
    return {
      require: 'ngModel',
      scope: {
        originalValue: '=matchTo'
      },
      link: function(scope, element, attributes, ngModel) {
        var eventReferences = [];
        ngModel.$validators.matchTo = function(modelValue) {
          return modelValue === scope.originalValue;
        };

        eventReferences.push(scope.$watch('originalValue', function() {
          ngModel.$validate();
        }));

        scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }
    };
  }

})();
