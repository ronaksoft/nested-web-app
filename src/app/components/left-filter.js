(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.date')
      .filter('leftDate', function (moment, NstSvcTranslation, NstSvcCalendarTranslation, NstSvcDate, NstUtility) {
  
        var dateFilter = function (date, args) {
          var haveTime = args && args === 'time';
          var current = NstSvcDate.now();
  
          if (!moment.isMoment(date)) {
            date = moment(date);
          }
          if (!haveTime) {
            date = moment(date).startOf('day').add(23, 'hours').add(59, 'minutes');
          }
          var overdue = moment(current).startOf('minute');
          if (date.isSameOrBefore(overdue)) {
            var daysDiff = overdue.diff(date, 'days');
            var hoursDiff = overdue.diff(date, 'hours');
            if (daysDiff > 1) {
              return NstUtility.string.format(NstSvcTranslation.get('{0} days ago'), daysDiff);
            }
            if (daysDiff > 0) {
              return NstUtility.string.format(NstSvcTranslation.get('{0} day ago'), daysDiff);
            }
            if (daysDiff === 0 && haveTime && hoursDiff > 1) {
              return NstUtility.string.format(NstSvcTranslation.get('{0} hours ago'), hoursDiff);
            }
            if (daysDiff === 0 && haveTime && hoursDiff > 0) {
              return NstUtility.string.format(NstSvcTranslation.get('{0} hour ago'), hoursDiff);
            }
            if (daysDiff === 0 && haveTime && hoursDiff === 0) {
              return NstUtility.string.format(NstSvcTranslation.get('about one hour ago'), hoursDiff);
            }
            return NstSvcTranslation.get('Time is passed!');
  
          }
  
          var diffDate = date.diff(moment(current));
          var diffDateDay = Math.floor(diffDate / (1000 * 60 * 60 * 24));
          var diffDateHour = Math.floor(diffDate / (1000 * 60 * 60));
          var diffDateMin = Math.floor(diffDate / (1000 * 60));

          if (diffDateDay > 0) {
            return NstUtility.string.format(NstSvcTranslation.get(diffDateDay > 1 ? '{0} days left' : '{0} day left'), diffDateDay);
          } else if( diffDateHour > 0 ) {
            return NstUtility.string.format(NstSvcTranslation.get(diffDateHour > 1 ? '{0} hours left' : '{0} hour left'), diffDateHour);
          } else if( diffDateMin > 0 ) {
            return NstUtility.string.format(NstSvcTranslation.get(diffDateMin > 1 ? '{0} minutes left' : '{0} minute left'), diffDateMin);
          } else {
            return NstSvcTranslation.get('Less than a minute');
          }

          return date.format(NstSvcCalendarTranslation.get('DD[/]MM[/]YYYY'));
        };
  
        dateFilter.$stateful = true;
  
        return dateFilter;
      });
  
  })();
  