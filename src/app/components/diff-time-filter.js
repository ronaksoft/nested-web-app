(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('diffTime', function (moment, NstSvcTranslation) {

      var diffTimeFilter = function (from, to) {
        if ((to + '').length === 10) {
          to *=  1000
        }
        var firstTime = moment(from);
        var secondTime = moment(to);
        var duration = Math.abs(firstTime.diff(secondTime, 'seconds'))
        var tempTime = moment.duration(duration, 'seconds');
        var minutes = tempTime.minutes();
        var hours = tempTime.hours();
        if (hours < 1) {
          return minutes + ' ' + NstSvcTranslation.get('minutes');
        } else if (hours === 1) {
          return '1 ' + NstSvcTranslation.get('hour');
        } else {
          return hours + ' ' + NstSvcTranslation.get('hours');
        }
      };

      diffTimeFilter.$stateful = true;

      return diffTimeFilter;
    });

})();
