(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('activityGroupDate', function(moment, NstSvcTranslation, NstSvcDate) {

      return function(date) {

        var foo = moment.unix(date);
        var todayStart = moment(NstSvcDate.now()).startOf('day');
        if (foo.isSameOrAfter(todayStart)) {
          return NstSvcTranslation.get("Today");
        }

        var thisMonthStart = moment(NstSvcDate.now()).startOf('month');
        if (foo.isSameOrAfter(thisMonthStart)) {
          return foo.clone().startOf('day').format("DD MMM");
        }

        var thisYearStart =  moment(NstSvcDate.now()).startOf('year');
        if (foo.isSameOrAfter(thisYearStart)) {
          return foo.clone().startOf('month').format("MMM YYYY");
        }

        return foo.clone().startOf('year').format("YYYY");
      }

    });
})();
