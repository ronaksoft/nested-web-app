(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('activityGroupDate', function(moment, NstSvcTranslation, NstSvcDate, NstSvcCalendarTranslation) {

      return function(date) {

        var foo = moment.unix(date);
        var todayStart = moment(NstSvcDate.now()).startOf('day');
        if (foo.isSameOrAfter(todayStart)) {
          return NstSvcTranslation.get("Today");
        }

        var thisMonthStart = moment(NstSvcDate.now()).startOf('month');
        if (foo.isSameOrAfter(thisMonthStart)) {
          return foo.clone().startOf('day').format(NstSvcCalendarTranslation.get("DD MMM"));
        }

        var thisYearStart =  moment(NstSvcDate.now()).startOf('year');
        if (foo.isSameOrAfter(thisYearStart)) {
          return foo.clone().startOf('month').format(NstSvcCalendarTranslation.get("MMM YYYY"));
        }

        return foo.clone().startOf('year').format(NstSvcCalendarTranslation.get("YYYY"));
      }

    });
})();
