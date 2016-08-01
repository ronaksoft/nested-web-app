(function() {
  'use strict';

  angular
    .module('nested')
    .filter('date', function() {

      return function(date, format) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        switch (format) {
          case 'relative':
            var today = moment().startOf('day');
            if (date.isSameOrAfter(today)) { // today
              return date.format('[Today at] HH:mm');
            }

            var yesterday = moment().startOf('day').subtract(1, 'days');
            if (date.isSameOrAfter(yesterday)) { // yesterday
              return date.format('[Yesterday at] HH:mm');
            }

            var year = moment().startOf('year');
            if (date.isSameOrAfter(year)) { // current year
              return date.format('MMM DD, HH:mm');
            }

            return date.format("MMM DD YYYY, HH:mm"); // last year and older
          case 'passed':
            // 'true' just removes the trailing 'ago'
            return date.fromNow(false);
          default:
            return date.format("MMM DD YYYY, HH:mm");

        }


      }
    });
})();
