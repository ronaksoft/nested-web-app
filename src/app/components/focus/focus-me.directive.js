(function() {
  'use strict';

  angular
    .module('nested')
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
