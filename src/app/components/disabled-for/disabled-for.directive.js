/**
 * @file src/app/components/disabled-for/disabled-for.directive.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Disables a button when you click on it and it will be enabled after a period of time.
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */

(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('nstDisableForBtn', function($interval, NstUtility, _) {
      return {
        restrict: 'A',
        replace: true,
        scope: {
          seconds: '=',
          click: '&',
          originalText: '@value'
        },
        link: function($scope, $element) {
          var timer = null;

          var seconds = $scope.seconds || 0;
          var jelement = $($element);
          jelement.val($scope.originalText);
          $element.bind('click', function() {
            if (timer) {
              $interval.cancel(timer);
            }
            if ($scope.click) {
              // Triggers the given function and disables the button for the specified time
              $scope.click();
              if (seconds > 0) {
                jelement.prop('disabled', true);
                timer = disable(jelement, seconds, $scope.originalText);
              }
            }
          });
          // Cancels the disable interval
          $scope.$on('$destroy', function() {
            if (timer) {
              $interval.cancel(timer);
            }
          });

        }
      };

      /**
       * Starts a countdown timer and displays the remaining time in front of the original text
       * When the time reaches the end, The button will be enabled again
       *
       * @param {any} element
       * @param {any} seconds
       * @param {any} originalText
       * @returns
       */
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

      /**
       * Writes the remaining seconds in {minutes}:{seconds} format like 2:20 or 0:09
       *
       * @param {any} seconds
       * @returns
       */
      function formatTime(seconds) {
        return NstUtility.string.format("{0}:{1}", _.padStart(Math.round(seconds / 60), 2, "0"), _.padStart(seconds % 60, 2, "0"));
      }
    });

})();
