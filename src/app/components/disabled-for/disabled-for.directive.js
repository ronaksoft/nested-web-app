(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('nstDisableForBtn', function($interval, NstUtility) {
      return {
        restrict: 'A',
        replace: true,
        scope: {
          seconds: '=',
          click: '&',
          originalText: '@value'
        },
        link: function($scope, $element, $attrs) {
          var timer = null;

          var seconds = $scope.seconds || 0;
          var jelement = $($element);
          jelement.val($scope.originalText);
          $element.bind('click', function(e) {
            if (timer) {
              $interval.cancel(timer);
            }
            if ($scope.click) {
              $scope.click();
              if (seconds > 0) {
                jelement.prop('disabled', true);
                timer = disable(jelement, seconds, $scope.originalText);
              }
            }
          });

          $scope.$on('$destroy', function() {
            if (timer) {
              $interval.cancel(timer);
            }
          });

        }
      };

      function disable(element, seconds, originalText) {
        var timer = null;

        timer = $interval(function() {
          seconds--;
          if (seconds > 0) {
            element.val(NstUtility.string.format("{0} {1}", originalText, formatTime(seconds)));
          } else {
            element.val(originalText);
            element.prop('disabled', false);

            if (timer) {
              $interval.cancel(timer);
            }
          }

        }, 1000);

        return timer;
      }

      function formatTime(seconds) {
        return NstUtility.string.format("{0}:{1}", _.padStart(Math.round(seconds / 60), 2, "0"), _.padStart(seconds % 60, 2, "0"));
      }
    });

})();
