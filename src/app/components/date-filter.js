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
          case 'time':
            return date.format("HH:mm");
          case 'short':
            var today = moment().startOf('day');
            if (date.isSameOrAfter(today)) { // today
              return date.format('HH:mm');
            }

            var yesterday = moment().startOf('day').subtract(1, 'days');
            if (date.isSameOrAfter(yesterday)) { // yesterday
              return date.format('[Yesterday ]HH:mm');
            }

            var year = moment().startOf('year');
            if (date.isSameOrAfter(year)) { // current year
              return date.format('MMM DD');
            }

            return date.format("MMM DD YYYY"); // last year and older
          case 'long':
            return date.format("MMM DD YYYY, HH:mm");
          case 'full':
            return date.format("dddd, MMMM DD YYYY, HH:mm");
          default:
            return date.format("dddd, MMMM DD YYYY, HH:mm");
        }
      }

    });
})();
