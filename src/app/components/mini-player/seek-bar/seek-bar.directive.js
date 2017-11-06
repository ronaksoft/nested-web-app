(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('seekBar', seekBar);

  /** @ngInject */
  function seekBar($rootScope) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/components/mini-player/seek-bar/seek-bar.html',
      scope: {
        barClick: '=',
        currentTime: '='
      },
      link: function (scope) {
        scope.barSeeker = function (e) {

          var barWidth = e.currentTarget.clientWidth;
          var x;

          if ($rootScope._direction !== 'rtl') {
            x = e.clientX - $(e.currentTarget).offset().left;
          } else {
            x = e.clientX - $(e.currentTarget).offset().left - barWidth;
          }
          var newRatio = Math.abs(x / barWidth);
          scope.barClick(newRatio)
        }
      }
    };
  }
})();
