(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('focusMe', function($timeout) {
      return {
        scope: { trigger: '@focusMe' },
        link: function(scope, element) {
          var triggerWatcherCleaner = null,
              focusTimeout = null;
          triggerWatcherCleaner = scope.$watch('trigger', function() {
              focusTimeout = $timeout(function() {
                element[0].focus();
              });
          });

          scope.$on('$destroy', function () {
            $timeout.cancel(focusTimeout);
            triggerWatcherCleaner();
          });
        }
      };
    });
})();
