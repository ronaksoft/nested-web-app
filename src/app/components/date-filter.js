(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('date', function(moment, NstUtility, NstSvcTranslation) {

      return function(date, format) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        switch (format) {
          case 'short':
            return date.format(NstSvcTranslation.get("YYYY-MM-DD"));
          case 'full':
          default:
            return date.format(NstSvcTranslation.get("dddd, MMMM DD YYYY, HH:mm"));
        }
      }

    });
})();
