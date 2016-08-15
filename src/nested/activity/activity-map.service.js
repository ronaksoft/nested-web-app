(function () {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityMap', NstSvcActivityMap);

  /** @ngInject */
  function NstSvcActivityMap(NstSvcAttachmentMap) {

    var service = {
      toRecentActivity: toRecentActivity,
      toActivityItems: toActivityItems,
      toActivityItem : toActivityItem
    };

    return service;

    function toRecentActivity(activity) {
      return {
        id: activity.id,
        actor: mapActivityActor(activity),
        member: mapActivityMember(activity),
        comment: mapActivityComment(activity),
        post: mapActivityPost(activity),
        date: activity.date,
        type: activity.type,
        place: mapActivityPlace(activity.place)
      };

      function mapActivityMember(activity) {
        if (!activity.member) {
          return {};
        }
        return {
          id: activity.member.id,
          name: activity.member.fullName,
          type: activity.member.type
        };
      }

      function mapActivityComment(activity) {
        if (!activity.comment) {
          return {};
        }

        return {
          id: activity.comment.id,
          body: activity.comment.body
        };
      }

      function mapActivityPost(activity) {
        if (!activity.post) {
          return {};
        }
        return {
          id: activity.post.id,
          subject: activity.post.subject,
          body: activity.post.body
        };
      }

      function mapActivityActor(activity) {
        return {
          id: activity.actor.id,
          avatar: activity.actor.picture.thumbnails.x32.url.download,
          fullname: activity.actor.getFullName(),
          name: activity.actor.firstName
        };
      }

      function mapActivityPlace(place) {
        if (place) {
          return {
            id: place.id,
            name: place.name,
            picture: place.picture.getThumbnail('64').url.download
          };
        }else{
          return null
        }
      }
    }

    /**
     * mapActivities - map a list of activities to a hierarchal form by date
     *
     * @param  {NstActivity}  acts   a flat list of activities
     * @return {Object}              a hierarchal form of activities
     */
    function toActivityItems(acts) {
      _.forEach(acts, function (act) {
        act.date = moment(act.date);
      });
      var result = {
        // min: null,
        // max: null,
        otherYears: {},
        thisYear: {},
        hasAnyItem: false,
        otherYearsHasAnyItem: false
      };
      var currentYearStart = moment().startOf('year');
      var currentMonthStart = moment().startOf('month');

      if (!acts || acts.length === 0) {
        return result;
      }

      result.hasAnyItem = true;

      // result.min = moment.min(_.map(acts, 'date'));
      // result.max = moment.max(_.map(acts, 'date'));

      var thisYearActs = _.filter(acts, function (act) {
        return act.date.isAfter(currentYearStart);
      });

      var thisMonthActs = _.filter(thisYearActs, function (act) {
        return act.date.isAfter(currentMonthStart);
      });

      var otherMontsActs = _.differenceBy(thisYearActs, thisMonthActs, 'id');

      result.thisYear = {
        // min: moment().startOf('year'),
        // max: moment().endOf('year'),
        thisMonth: mapThisMonthActs(thisMonthActs),
        otherMonths: groupByMonth(otherMontsActs),
        hasAnyItem: thisYearActs.length > 0,
        otherMonthsHasAnyItem: otherMontsActs.length > 0
      };

      var otherYearsActs = _.differenceBy(acts, thisYearActs, 'id');

      result.otherYearsHasAnyItem = otherYearsActs.length > 0;

      result.otherYears = groupByYear(otherYearsActs);

      return result;
    }

    /**
     * groupByYear - group a list of activities by year
     *
     * @param  {NstActivity}  acts   list of activities
     * @return {Object}              pairs of year and activity list, consider year as key
     */
    function groupByYear(acts) {
      var years = [];

      if (!acts || acts.length === 0) {
        return years;
      }

      // there are some activities of past years
      var yearGroups = _.groupBy(acts, function (act) {
        return act.date.year();
      });
      _.forIn(yearGroups, function (yearActs, year) {
        var yearMoment = yearActs[0].date;

        // var min = yearMoment.startOf('year');
        // var max = yearMoment.endOf('year');

        years.push({
          // min: min,
          // max: max,
          date: yearMoment.clone().startOf('year').format('YYYY'),
          items: mapActivityItems(sortActivities(yearActs))
        });
      });

      return years;
    }

    /**
     * groupByMonth - group a list of activities by month
     *
     * @param  {NstActivity[]}  acts   list of activities
     * @return {Object}                pairs of month and activity list, consider month as key
     */
    function groupByMonth(acts) {
      var months = [];

      if (!acts || acts.length === 0) {
        return months;
      }
      var monthGroups = _.groupBy(acts, function (act) {
        return act.date.month();
      });

      _.forIn(monthGroups, function (monthActs, month) {
        var monthMoment = monthActs[0].date;
        // var max = monthMoment.endOf('month');
        // var min = monthMoment.startOf('month');

        months.push({
          // min: min,
          // max: max,
          date: monthMoment.clone().startOf('month').format('MMM YYYY'),
          items: mapActivityItems(sortActivities(monthActs))
        });
      });

      return months;
    }

    /**
     * mapThisMonthActs - description
     *
     * @param  {NstActivity[]}  acts   list of activities
     * @return {Object}                model contains today and the older days activities
     */
    function mapThisMonthActs(acts) {
      var result = {
        // min: null,
        // max: null,
        today: {},
        otherDays: {},
        hasAnyItem: false,
        otherDaysHasAnyItem: false
      };

      if (!acts || acts.length === 0) {
        return result;
      }

      result.hasAnyItem = true;

      var todayStart = moment().startOf('day');
      // result.min = moment().startOf('month');
      // result.max = moment().endOf('month');

      var todayActs = _.filter(acts, function (act) {
        return act.date.isAfter(todayStart);
      });

      result.today = {
        // min: todayStart,
        // max: moment().endOf('day'),
        items: mapActivityItems(sortActivities(todayActs)),
        hasAnyItem: todayActs.length > 0
      };

      var otherDaysActs = _.differenceBy(acts, todayActs, 'id');

      result.otherDaysHasAnyItem = otherDaysActs.length > 0;

      result.otherDays = groupByDay(otherDaysActs);

      return result;
    }

    /**
     * groupByDay - group a list of activities by day
     *
     * @param  {NstActivity[]}  acts  list of activities
     * @return {Object}               pairs of day and activity list, consider day as key
     */
    function groupByDay(acts) {
      var days = [];

      if (!acts || acts.length === 0) {
        return days;
      }

      var dayGroups = _.groupBy(acts, function (act) {
        return act.date.date();
      });

      _.forInRight(dayGroups, function (dayActs, day) {
        var dayMoment = dayActs[0].date;

        // var min = dayMoment.startOf('day');
        // var max = dayMoment.endOf('day');

        days.push({
          // min : min,
          // max : max,
          date: dayMoment.clone().startOf('day').format('DD MMM'),
          items: mapActivityItems(sortActivities(dayActs))
        });

      });

      return days;
    }

    function mapActivityItems(activities) {
      var items = _.map(activities, function (item) {

        return toActivityItem(item);
      });

      return items;
    }

    function mapActivityMember(activity) {
      if (!activity.member || !activity.member.id) {
        return {};
      }
      return {
        id: activity.member.id,
        name: activity.member.fullName,
        type: activity.member.type
      };
    }

    function mapActivityComment(activity) {
      if (!activity.comment || !activity.comment.id) {
        return {};
      }

      return {
        id: activity.comment.id,
        body: activity.comment.body,
        postId: activity.post.id
      };
    }

    function mapActivityPost(activity) {
      if (!activity.post || !activity.post.id) {
        return {};
      }
      var firstPlace = _.first(activity.post.places);
      return {
        id: activity.post.id,
        subject: activity.post.subject,
        body: activity.post.body,
        attachments: _.map(activity.post.attachments, NstSvcAttachmentMap.toAttachmentItem),
        hasAnyAttachment: activity.post.attachments ? activity.post.attachments.length > 0 : false,
        firstPlace: mapPostPlace(firstPlace),
        allPlaces: _.map(activity.post.places, mapPostPlace),
        otherPlacesCount: activity.post.places.length - 1,
        allPlacesCount: activity.post.places.length
      };
    }

    function mapActivityActor(activity) {
      return {
        id: activity.actor.id,
        avatar: activity.actor.picture.thumbnails.x32.url.download,
        name: activity.actor.fullName
      };
    }

    function mapPostPlace(place) {
      if (!place || !place.id) {
        return {};
      }

      return {
        id: place.id,
        name: place.name
        //picture : place.picture.thumbnails.x64.url.download
      };
    }

    function mapActivityPlace(activity) {
      if (!activity.place || !activity.place.id) {
        return {};
      }

      return {
        id: activity.place.id,
        name: activity.place.name,
        picture: activity.place.picture.thumbnails.x64.url.download,
        hasParent: !!activity.place.parent,
        parent: mapParentPlace(activity)
      };
    }

    function mapParentPlace(activity) {
      if (!activity.place || !activity.place.parent) {
        return {};
      }

      var parentPlace = {
        id: activity.place.getParent().getId(),
        name: activity.place.getParent().getName(),
        picture: '/assets/icons/absents_place.svg'
      };

      if (activity.place.getParent().getPicture().getThumbnail(64)) {
        parentPlace.picture = activity.place.getParent().getPicture().getThumbnail(64).getUrl().view;
      } else if (activity.place.getParent().getPicture().getLargestThumbnail()) {
        parentPlace.picture = activity.place.getParent().getPicture().getLargestThumbnail().getUrl().view;
      } else if (activity.place.getParent().getPicture().getId()) {
        parentPlace.picture = activity.place.getParent().getPicture().getOrg().getUrl().view;
      }

      return parentPlace;
    }

    function sortActivities(activities) {
      return _.orderBy(activities, 'date', 'desc');
    }

    function toActivityItem(activity) {
      return {
        id: activity.id,
        actor: mapActivityActor(activity),
        member: mapActivityMember(activity),
        comment: mapActivityComment(activity),
        place: mapActivityPlace(activity),
        post: mapActivityPost(activity),
        date: moment(activity.date),
        type: activity.type
      };
    }
  }

})();
