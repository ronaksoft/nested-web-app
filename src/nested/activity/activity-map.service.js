(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityMap', NstSvcActivityMap);

  /** @ngInject */
  function NstSvcActivityMap(moment, _ ,NstSvcDate) {

    var service = {
      toActivityItems: groupByTime,
      groupByTime: groupByTime,
      mergeGroup: mergeGroup,
      appendGroup: appendGroup,
      putInGroup: putInGroup
    };

    return service;

    /**
     * mapActivities - map a list of activities to a hierarchal form by date
     *
     * @param  {NstActivity}  acts   a flat list of activities
     * @return {Object}              a hierarchal form of activities
     */
    function groupByTime(acts) {

      return _.chain(acts).compact().groupBy(function (activity) {
        var date = moment(activity.date || activity.timestamp);
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

    function mergeGroup(group, activities) {
      var finalGroups = group;
      var activityGroups = groupByTime(activities);
      _.forEach(activityGroups, function (targetGroup) {
        var sourceGroup = _.find(finalGroups, { date: targetGroup.date });
        if (sourceGroup) {
          // merge
          var newItems = _.differenceBy(targetGroup.items, sourceGroup.items, 'id');
          var removedItems = _.differenceBy(sourceGroup.items, targetGroup.items, 'id');
          // first omit the removed items; The items that are no longer exist in fresh activities
          _.forEach(removedItems, function (item) {
            var index = _.findIndex(sourceGroup.items, { 'id': item.id });
            if (index > -1) {
              sourceGroup.items.splice(index, 1);
            }
          });

          // add new items; The items that do not exist in cached items, but was found in fresh activities
          sourceGroup.items.unshift.apply(sourceGroup.items, newItems);
        } else { // add
          finalGroups.push(targetGroup);
        }
      });
      return finalGroups;
    }

    function appendGroup(group, activities) {
      var finalGroups = group;
      var activityGroups = groupByTime(activities);
      _.forEach(activityGroups, function (targetGroup) {
        var sourceGroup = _.find(finalGroups, { date : targetGroup.date });
        if (sourceGroup) { // merge
          sourceGroup.items.push.apply(sourceGroup.items, targetGroup.items);
        } else { // add
          finalGroups.push(targetGroup);
        }
      });
      return finalGroups
    }

    function putInGroup(group, activities) {
      var finalGroups = group;
      var activityGroups = groupByTime(activities);
      _.forEachRight(activityGroups, function (targetGroup) {
        var sourceGroup = _.find(finalGroups, { date : targetGroup.date });
        if (sourceGroup) { // merge
          _.forEach(targetGroup.items, function (item) {
            if (!_.some(sourceGroup.items, { id : item.id })) {
              sourceGroup.items.unshift(item);
            }
          });
        } else { // add
          finalGroups.unshift(targetGroup);
        }
      });
      return finalGroups;
    }

  }

})();
