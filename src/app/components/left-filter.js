(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .filter('leftDate', function(moment, NstSvcTranslation, NstSvcCalendarTranslation, NstSvcDate, NstUtility) {

      var dateFilter = function(date, args) {
        var haveTime = args && args === 'time'

        var current = NstSvcDate.now();

        if (!moment.isMoment(date)) {
          date = moment(date);
        }


        var overdue = moment(current).startOf('minute');
        if (date.isSameOrBefore(overdue)) {
          return NstSvcTranslation.get('Time is passed !');
        }

        var justNow = moment(current).startOf('minute').add(1, 'minutes');
        if (date.isSameOrBefore(justNow)) {
          return NstSvcTranslation.get('Less than a minute');
        }

        var today = moment(current).startOf('day').add(1, 'days');
        if (date.isSameOrBefore(today)) {
          return haveTime ?
          date.format(NstSvcCalendarTranslation.get('[Today at] HH:mm')) :
          date.format(NstSvcCalendarTranslation.get('[Today]')) ;
        }

        var tommorrow = moment(current).startOf('day').add(2, 'days');
        if (date.isSameOrBefore(tommorrow)) {
          return haveTime ? 
          date.format(NstSvcCalendarTranslation.get('[Tommorow at] HH:mm')) :
          date.format(NstSvcCalendarTranslation.get('[Tommorow]'));
        }

        var thisMonth = moment(current).startOf('minute').add(30, 'days');
        if (date.isSameOrBefore(thisMonth)) {
          // TODO  why add 1 days ? 
          return NstSvcTranslation.get(NstUtility.string.format('{0} days left', date.add(1, 'days').diff(justNow, 'days')));
        }

        var thisYear = moment(current).startOf('year');
        if (date.isSameOrBefore(thisYear)) {
          return date.format(NstSvcCalendarTranslation.get('MMM DD'));
        }

        return date.format(NstSvcCalendarTranslation.get('DD[/]MM[/]YYYY'));
      }

      dateFilter.$stateful = true;

      return dateFilter;
    });

})();
