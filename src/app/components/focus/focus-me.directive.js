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
            if (val == 'true' || parseInt(val) > 0) {
              var el = element[0];
              el.focus();
              if (typeof el.selectionStart == "number") {
                el.selectionStart = el.selectionEnd = el.value.length;
              } else if (typeof el.createTextRange != "undefined") {
                var range = el.createTextRange();
                range.collapse(false);
                range.select();
              }
            }
          });
          scope.$on('$destroy', function () {
            triggerWatcherCleaner();
          });
        }
      };
    });
})();
