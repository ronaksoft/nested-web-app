(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('durationToTime', function(){
      return function(duration) {
        duration = Math.floor(parseInt(duration));
        if (isNaN(duration)) {
          return '';
        }
        var isNegative = false;
        if (duration < 0) {
          duration = -duration;
          isNegative = true;
        }
        var second = duration%60;
        second = second.toString();
        if (second.length === 1) {
          second = '0' + second;
        }
        var minute = Math.floor(duration/60);
        minute = minute.toString();
        if (minute.length === 1) {
          minute = '0' + minute;
        }
        return (isNegative? '-' : '') + minute + ':' + second
      };
    });
})();
