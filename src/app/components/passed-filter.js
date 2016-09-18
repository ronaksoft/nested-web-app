(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('passed', function() {

      var dateFilter = function(date) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        // 'true' just removes the trailing 'ago'
        return date.fromNow(false);
      }

      dateFilter.$stateful = true;

      return dateFilter;
    });
})();
