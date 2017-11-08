(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('duration', function (moment) {

      var durationFilter = function (allSeconds) {
        var tempTime = moment.duration(allSeconds, 'milliseconds');
        var minutes = tempTime.minutes();
        var hours = tempTime.hours();
        var seconds = tempTime.seconds();
        if (hours > 0) {
          minutes = (hours * 60) + minutes
        }
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        if (seconds < 10) {
          seconds = '0' + seconds;
        }
        return minutes + ':' + seconds;
      };

      durationFilter.$stateful = true;

      return durationFilter;
    });

})();
