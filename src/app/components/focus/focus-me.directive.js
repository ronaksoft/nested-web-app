(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('focusMe', function() {
      return {
        scope: { trigger: '@focusMe' },
        link: function(scope, element) {
          var triggerWatcherCleaner = null;
          triggerWatcherCleaner = scope.$watch('trigger', function(val) {
            if (val) {
              element[0].focus();
            }
          });
          scope.$on('$destroy', function () {
            triggerWatcherCleaner();
          });
        }
      };
    });
})();
