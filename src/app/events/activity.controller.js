  (function() {
    'use strict';

    angular
      .module('nested')
      .controller('ActivityController', ActivityController);

    /** @ngInject */
    function ActivityController($location, $scope, $q, $rootScope, $stateParams, $log, $uibModal,
      toastr, _, moment,
      NstSvcAuth, NstSvcServer, NST_SRV_EVENT, NST_EVENT_ACTION, NST_SRV_ERROR, NST_STORAGE_TYPE, NST_ACTIVITY_FILTER,
      NstSvcLoader, NstSvcActivityFactory, NstSvcInvitationFactory,
      NstActivity, NstPlace, NstInvitation) {
      var vm = this;

      //TODO it needs to connect with cache
      vm.extended = true;

      vm.activities = [];
      vm.loadMore = loadMore;
      vm.acceptInvitation = acceptInvitation;
      vm.declineInvitation = declineInvitation;
      vm.applyFilter = applyFilter;
      vm.viewPost = viewPost;
      vm.readyToScroll = true;
      vm.scroll = scroll;
      vm.filters = {
        '!$all': {
          filter: 'all',
          name: 'All'
        },
        '!$messages': {
          filter: 'messages',
          name: 'Messages'
        },
        '!$comments': {
          filter: 'comments',
          name: 'Comments'
        },
        '!$log': {
          filter: 'log',
          name: 'Log'
        }
      };
      vm.activitySettings = {
        skip: 0,
        limit: 25,
        filter: NST_ACTIVITY_FILTER.ALL
      };

      if (!NstSvcAuth.isInAuthorization()) {
        $location.search({
          back: $location.path()
        });
        $location.path('/signin').replace();
      }

      function initialize() {
        // return $q.all([loadActivities(), loadInvitations()]);
        return $q.all([loadActivities()]);
      }

      initialize().then(function (values) {
      }).catch(function (error) {
        $log.debug(error);
      });

      function loadActivities() {
        return $q(function(resolve, reject) {
          NstSvcActivityFactory.load(vm.activitySettings).then(function(activities) {
            vm.acts = mapActivities(activities);
            $log.debug(vm.acts);
            resolve(vm.acts);

          }).catch(reject);
        });
      };

      function loadInvitations() {
        return $q(function(resolve, reject) {
          NstSvcInvitationFactory.get().then(function(invitations) {

            vm.invitations = invitations;
            resolve(vm.invitations);

          }).catch(reject);
        });
      }

      function loadMore() {
        return loadActivities();
      }

      function acceptInvitation(invitation) {
        NstSvcInvitationFactory.accept(invitation).then(function(result) {

        }).catch(function(result) {

        });
      }

      function declineInvitation(invitation) {
        NstSvcInvitationFactory.decline(invitation).then(function(result) {

        }).catch(function(result) {

        });
      }

      function applyFilter(filter) {
        vm.activitySettings.filter = vm.filters[filter].filter;
        loadActivities().then(function() {}).catch(function(error) {
          $log.debug(error);
        });
      }

      function viewPost(postId) {
        NstSvcPostFactory.getWithComments(postId).then(function(post) {
          // TODO: open a modal and show the post
        }).catch(function(error) {

        });
      }

      function scroll(event) {
        var element = event.currentTarget;
        if (element.scrollTop + element.clientHeight + 10 > element.scrollHeight && this.moreEvents) {

          if (vm.readyToLoad) {
            vm.readyToLoad = false;
            load();
          }
        }
      }

    }

    /**
     * mapActivities - map a list of activities to a hierarchal form by date
     *
     * @param  {NstActivity}  acts   a flat list of activities
     * @return {Object}              a hierarchal form of activities
     */
    function mapActivities(acts) {
      _.forEach(acts, function (act) {
        act.date = moment(act.date);
      })
      var result = {
        min: null,
        max: null,
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

      result.min = moment.min(_.map(acts, 'date'));
      result.max = moment.max(_.map(acts, 'date'));

      var thisYearActs = _.filter(acts, function(act) {
        return act.date.isAfter(currentYearStart);
      });

      var thisMonthActs = _.filter(thisYearActs, function(act) {
        return act.date.isAfter(currentMonthStart);
      });

      var otherMontsActs = _.differenceBy(thisYearActs, thisMonthActs, 'id');

      result.thisYear = {
        min: moment().startOf('year'),
        max: moment().endOf('year'),
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
      var years = {};

      if (!acts || acts.length === 0) {
        return years;
      }

      // there are some activities of past years
      var yearGroups = _.groupBy(acts, function(act) {
        return act.date.year();
      });
      _.forIn(yearGroups, function(yearActs, year) {
        var yearMoment = yearActs[0].date;

        years[year] = {
          min: yearMoment.startOf('year'),
          max: yearMoment.endOf('year'),
          items: mapActivityItems(yearActs)
        };
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
      var months = {};

      if (!acts || acts.length === 0) {
        return months;
      }
      var monthGroups = _.groupBy(acts, function(act) {
        return act.date.month();
      });

      _.forIn(monthGroups, function(monthActs, month) {
        var monthMoment = monthActs[0].date;

        months[month] = {
          min: monthMoment.startOf('month'),
          max: monthMoment.endOf('month'),
          items: mapActivityItems(monthActs)
        };
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
        min: null,
        max: null,
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
      result.min = moment().startOf('month');
      result.max = moment().endOf('month');

      var todayActs = _.filter(acts, function(act) {
        return act.date.isAfter(todayStart);
      });

      result.today = {
        min: todayStart,
        max: moment().endOf('day'),
        items: mapActivityItems(todayActs),
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
      var days = {};

      if (!acts || acts.length === 0) {
        return days;
      }

      var dayGroups = _.groupBy(acts, function(act) {
        return act.date.date();
      });
      _.forIn(dayGroups, function(dayActs, day) {
        var dayMoment = dayActs[0].date;

        days[day] = {
          min: dayMoment.startOf('day'),
          max: dayMoment.endOf('day'),
          items: mapActivityItems(dayActs)
        };

      });

      return days;
    }

    function mapActivityItems(activities) {
      var items = _.map(activities, function (item) {

        return {
          id : item.id,
          actor : mapActivityActor(item),
          member : mapActivityMember(item),
          comment : mapActivityComment(item),
          place : mapActivityPlace(item),
          post : mapActivityPost(item),
          elapsed : getPassedTime(item.date),
          date : moment(item.date).format('dddd, MMMM Do YYYY, HH:mm'),
          type : item.type
        };
      });

      return items;
    }

    function getPassedTime(date) {
      if (!moment.isMoment(date)) {
        date = moment(date);
      }

      return date.fromNow();
    }

    function mapActivityMember(activity) {
      if (!activity.member || !activity.member.id) {
        return {};
      }
      return {
        id : activity.member.id,
        name : activity.member.fullName,
        type : activity.member.type
      };
    }

    function mapActivityComment(activity) {
      if (!activity.comment || !activity.comment.id) {
        return {};
      }

      return {
        id : activity.comment.id,
        body : activity.comment.body,
        postId : activity.post.id,
      };
    }

    function mapActivityPost(activity) {
      if (!activity.post || !activity.post.id) {
        return {};
      }
      var firstPlace = _.first(activity.post.places);
      return {
        id : activity.post.id,
        subject : activity.post.subject,
        body : activity.post.body,
        attachments : _.map(activity.post.attachments, mapPostAttachment),
        hasAnyAttachment : activity.post.attachments ? activity.post.attachments.length > 0 : false,
        firstPlace : mapPostPlace(firstPlace),
        allPlaces : _.map(activity.post.places, mapPostPlace),
        otherPlacesCount : activity.post.places.length -1,
        allPlacesCount : activity.post.places.length
      };
    }

    function mapActivityActor(activity) {
      return {
        id : activity.actor.id,
        avatar : activity.actor.picture.thumbnails.x32.url.download,
        name : activity.actor.fullName
      };
    }

    function mapPostAttachment(attach) {
      if (!attach || !attach.id) {
        return {}
      }
      return {
        fileName : attach.fileName,
        size : attach.size,
        url : attach.file.url,
        type : findFileType(attach),
        format : findFileFormat(attach),
        thumbnail : attach.thumbnail.getThumbnail('128').url.download
      };
    }

    function mapPostPlace(place) {
      if (!place || !place.id) {
        return {};
      }

      return {
        id : place.id,
        name : place.name,
        //picture : place.picture.thumbnails.x64.url.download
      };
    }

    function mapActivityPlace(activity) {
      if (!activity.place || !activity.place.id){
        return {};
      }

      return {
        id : activity.place.id,
        name : activity.place.name,
        picture : activity.place.picture.thumbnails.x64.url.download,
        hasParent : !!activity.place.parent,
        parent : mapParentPlace(activity),
      };
    }

    function mapParentPlace(activity) {
      if (!activity.place || !activity.place.parent) {
        return {};
      }

      return {
        id : activity.place.parent.id,
        name : activity.place.parent.name,
        picture : activity.place.parent.picture.thumbnails.x64.url.download,
      };
    }

  })();
