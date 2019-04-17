(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('date', function(moment, NstUtility, NstSvcCalendarTranslation) {

      return function(date, format) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        switch (format) {
          case 'short':
            return date.format(NstSvcCalendarTranslation.get("YYYY-MM-DD"));
          case 'file-date':
            return date.format(NstSvcCalendarTranslation.get("MMM DD, YYYY HH:mm"));
          case 'full-only-date':
            return date.format(NstSvcCalendarTranslation.get("dddd, YYYY MMMM DD"));
          case 'full':
          default:
            return date.format(NstSvcCalendarTranslation.get("dddd, MMMM DD YYYY, HH:mm"));
        }
      }

    });
})();
