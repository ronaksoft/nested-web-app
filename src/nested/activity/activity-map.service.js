(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityMap', NstSvcActivityMap);

  /** @ngInject */
  function NstSvcActivityMap(moment, _ ,NstSvcDate) {

    var service = {
      toActivityItems: toActivityItems
    };

    return service;

    /**
     * mapActivities - map a list of activities to a hierarchal form by date
     *
     * @param  {NstActivity}  acts   a flat list of activities
     * @return {Object}              a hierarchal form of activities
     */
    function toActivityItems(acts) {

      return _.chain(acts).compact().groupBy(function (activity) {
        var date = moment(activity.date);
        var now = NstSvcDate.now();

        var thisMonthStart = moment(now).startOf('month');
        if (date.isSameOrAfter(thisMonthStart)) {
          return date.clone().startOf('day').unix();
        }

        var thisYearStart =  moment(now).startOf('year');
        if (date.isSameOrAfter(thisYearStart)) {
          return date.clone().startOf('month').unix();
        }

        return date.clone().startOf('year').unix();
      }).map(function (activities, date) {
        return {
          date : date,
          items : activities
        };
      }).orderBy('date', 'desc').value();
    }

  }

})();
