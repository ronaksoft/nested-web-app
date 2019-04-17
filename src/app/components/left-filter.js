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
  
          var diffDate = date.diff(moment(current));
          var str = ' left';

          if (diffDate < 0) {
            diffDate = diffDate * -1;
            str = ' ago';
          }

          var diffDateDay = Math.floor(diffDate / (1000 * 60 * 60 * 24)),
              diffDateHour = Math.floor(diffDate / (1000 * 60 * 60)),
              diffDateMin = Math.floor(diffDate / (1000 * 60));

          if(diffDateDay > 1 || diffDateDay === 1 && haveTime) {
            return NstUtility.string.format(NstSvcTranslation.get('{0} ' + (diffDateDay > 1 ? 'days' : 'day') + str), diffDateDay);
          } else if(diffDateHour > 0) {
            var tonight = moment(current).startOf('day').add(1, 'days');
            var lastNight = moment(current).startOf('day');
            if (date.isSameOrBefore(lastNight)) {
              return date.format(NstSvcTranslation.get(haveTime ? '[Yesterday at] HH:mm' : '[Yesterday]'))
            } else if (date.isSameOrBefore(tonight)){
              return date.format(NstSvcTranslation.get(haveTime ? '[Today at] HH:mm' : '[Today]'))
            } else {
              return date.format(NstSvcTranslation.get(haveTime? '[Tomorrow at] HH:mm': '[Tomorrow]'))
            }
          } else if(diffDateMin > 0) {
            return NstUtility.string.format(NstSvcTranslation.get('{0} ' + (diffDateMin > 1 ? 'minutes' : 'minute') + str), diffDateMin);
          } else {
            return NstSvcTranslation.get('Less than a minute');
          }

          return date.format(NstSvcCalendarTranslation.get('DD[/]MM[/]YYYY'));
        };
  
        dateFilter.$stateful = true;
  
        return dateFilter;
      });
  
  })();
  