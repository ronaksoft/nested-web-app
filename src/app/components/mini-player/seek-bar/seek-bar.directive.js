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
        // scope.barSeeker = function (e) {

        //   var barWidth = e.currentTarget.clientWidth;
        //   var x;

        //   if ($rootScope._direction !== 'rtl') {
        //     x = e.clientX - $(e.currentTarget).offset().left;
        //   } else {
        //     x = e.clientX - $(e.currentTarget).offset().left - barWidth;
        //   }
        //   var newRatio = Math.abs(x / barWidth);
        //   scope.barClick(newRatio)
        // }
        scope.bar;
        var volumeDrag = false;

        scope.mousedown = function (e) {
            volumeDrag = true;
            scope.bar = e.currentTarget;
            updateCurrentTime(e.pageX);
        };
        scope.mouseup = function (e) {
            if (volumeDrag) {
                volumeDrag = false;
                updateCurrentTime(e.pageX);
            }
        };
        scope.mousemove = function (e) {
            if (volumeDrag) {
              updateCurrentTime(e.pageX);
            }
        };
        
        var updateCurrentTime = function (x) {
          var percentage;
          //if only volume have specificed
          //then direct update volume
          var position = x - $(scope.bar).offset().left
          percentage = 100 * position / scope.bar.clientWidth;
      
          if (percentage > 100) {
              percentage = 100;
          }
          if (percentage < 0) {
              percentage = 0;
          }
          scope.currentTime.ratio = percentage / 100;
          scope.barClick(percentage / 100)
      
      };
      }
    };
  }
})();
