(function() {
  'use strict';

  angular
    .module('nested')
    .directive('ngProgressbar', function ($timeout, _, progressBar, NST_PROGRESSBAR_MODE) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
          ngProgressbar: '@',
          mode: '@progressbarMode'
        },
        link: function (scope, element) {
          var constructor = progressBar.Line;
          if (scope.mode) {
            var qMode = String(scope.mode).toLowerCase().split('').map(function (v, i) { return 0 == i ? v.toUpperCase() : v; }).join('');
            if (modeIsValid(qMode)) {
              constructor = progressBar[qMode];
            }
          }

          var progressbar = new constructor(element[0], {
            color: '#14d769',
            strokeWidth: 6,
            trailWidth: 1,
            easing: 'easeInOut',
            duration: 1400
          });
          scope.$watch('ngProgressbar', function (newVal) {
            progressbar.animate(Number(newVal));
          });
        }
      };

      function modeIsValid(mode) {
        return _.values(NST_PROGRESSBAR_MODE).indexOf(mode) > -1;
      }
    });
})();
