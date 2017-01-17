(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityMap', NstSvcActivityMap);

  /** @ngInject */
  function NstSvcActivityMap(NstSvcAttachmentMap, moment, NstSvcStore) {

    var service = {
      toActivityItems: toActivityItems,
    };

    return service;

    /**
     * mapActivities - map a list of activities to a hierarchal form by date
     *
     * @param  {NstActivity}  acts   a flat list of activities
     * @return {Object}              a hierarchal form of activities
     */
    function toActivityItems(acts) {
      var todayStart = moment().startOf('day');
      var thisMonthStart = moment().startOf('month');
      var thisYearStart =  moment().startOf('year');

      return _.chain(acts).groupBy(function (activity) {
        if (!moment.isMoment(activity.date)){
          activity.date = moment(activity.date);
        }

        if (activity.date.isAfter(todayStart)) {
          return "Today";
        } else if (activity.date.isAfter(thisMonthStart)) {
          return activity.date.clone().startOf('day').format("DD MMM");
        } else if (activity.date.isAfter(thisYearStart)) {
          return activity.date.clone().startOf('month').format("MMM YYYY");
        } else {
          return activity.date.clone().startOf('year').format("YYYY");
        }
      }).map(function (activities, date) {
        return {
          date : date,
          items : activities
        };
      }).value();
    }

  }

})();
