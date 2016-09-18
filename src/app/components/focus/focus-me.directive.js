(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('focusMe', function($timeout) {
      return {
        scope: { trigger: '@focusMe' },
        link: function(scope, element) {
          scope.$watch('trigger', function() {
              $timeout(function() {
                element[0].focus();
              });
          });
        }
      };
    });
})();
