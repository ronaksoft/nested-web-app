(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('passed', function(moment, NstSvcTranslation) {

      var dateFilter = function(date) {
        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        var justNow = moment().startOf('minute');
        if (date.isSameOrAfter(justNow)) {
          return NstSvcTranslation.get('Just Now');
        }

        var today = moment().startOf('day');
        if (date.isSameOrAfter(today)) {
          return date.format(NstSvcTranslation.get('HH:mm'));
        }

        var yesterday = moment().startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) {
          return date.format(NstSvcTranslation.get('[Yesterday] HH:mm'));
        }

        var thisYear = moment().startOf('year');
        if (date.isSameOrAfter(thisYear)) {
          return date.format(NstSvcTranslation.get('MMM DD'));
        }

        return date.format(NstSvcTranslation.get('DD[/]MM[/]YYYY'));
      }

      dateFilter.$stateful = true;

      return dateFilter;
    });

})();
