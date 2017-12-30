(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('focusMe', function() {
      return {
        link: function(scope, element, attrs) {
          var triggerWatcherCleaner = null;
          triggerWatcherCleaner = scope.$watch(function (){
            return attrs.focusMe;
          }, function(val) {
            if (val == 'true') {
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
