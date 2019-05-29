(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('duration', function (moment, NstSvcTranslation) {

      var durationFilter = function (allSeconds, format) {
        var tempTime = moment.duration(allSeconds, 'milliseconds');
        var minutes = tempTime.minutes();
        var hours = tempTime.hours();
        var seconds = tempTime.seconds();
        var weeks = tempTime.weeks();
        var days = tempTime.days();
        switch (format) {
          case 'weekly':
            return weeks + ' ' + NstSvcTranslation.get('weeks');
          case 'daily':
            return days + ' ' + NstSvcTranslation.get('days');
          case 'hourly':
          if (hours < 1) {
            return minutes + ' ' + NstSvcTranslation.get('minutes');
          } else if (hours === 1) {
            return '1 ' + NstSvcTranslation.get('hour');
          } else {
            return hours + ' ' + NstSvcTranslation.get('hours');
          }
          default:
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
        }
      };

      durationFilter.$stateful = true;

      return durationFilter;
    });

})();
