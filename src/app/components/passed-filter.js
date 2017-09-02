(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('passed', function(moment, NstSvcTranslation, NstSvcCalendarTranslation, NstSvcDate) {

      var dateFilter = function(date) {

        var current = NstSvcDate.now();

        if (!moment.isMoment(date)) {
          date = moment(date);
        }


        var justNow = moment(current).startOf('minute');
        if (date.isSameOrAfter(justNow)) {
          return NstSvcTranslation.get('Just Now');
        }

        var today = moment(current).startOf('day');
        if (date.isSameOrAfter(today)) {
          return date.format(NstSvcCalendarTranslation.get('HH:mm'));
        }

        var yesterday = moment(current).startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
          return date.format(NstSvcCalendarTranslation.get('[Yesterday] HH:mm'));
        }

        var thisYear = moment(current).startOf('year');
        if (date.isSameOrAfter(thisYear)) {
          return date.format(NstSvcCalendarTranslation.get('MMM DD'));
        }

        return date.format(NstSvcCalendarTranslation.get('DD[/]MM[/]YYYY'));
      }

      dateFilter.$stateful = true;

      return dateFilter;
    });

})();
