(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('activityGroupDate', function(moment, NstSvcTranslation) {

      return function(date) {

        var foo = moment.unix(date);
        var todayStart = moment().startOf('day');
        if (foo.isSameOrAfter(todayStart)) {
          return NstSvcTranslation.get("Today");
        }

        var thisMonthStart = moment().startOf('month');
        if (foo.isSameOrAfter(thisMonthStart)) {
          return foo.clone().startOf('day').format("DD MMM");
        }

        var thisYearStart =  moment().startOf('year');
        if (foo.isSameOrAfter(thisYearStart)) {
          return foo.clone().startOf('month').format("MMM YYYY");
        }

        return foo.clone().startOf('year').format("YYYY");
      }

    });
})();
