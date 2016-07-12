(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ActivityController', ActivityController);

  /** @ngInject */
  function ActivityController($location, $scope, $q, $rootScope, $stateParams, $log, $uibModal,
                            toastr, _, moment,
                            AuthService, WsService, NST_WS_EVENT, NST_EVENT_ACTION, NST_WS_ERROR, NST_STORAGE_TYPE, NST_ACTIVITY_FILTER,
                            LoaderService, NstSvcStorageFactory,
                            NstActivity, NstPlace, NstInvitation) {
    var vm = this;

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

    if (!AuthService.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    function initialize() {
      return $q.all([loadActivities, loadInvitations]);
    }

    function loadActivities() {
      return $q(function (resolve, reject) {
        NstSvcActivityFactory.load(vm.activitySettings).then(function (activities) {
          vm.acts = mapActivities(activities);
          resolve(activities);
        }).catch(reject);
      });
    };

    function loadInvitations() {
      return $q(function (resolve, reject) {
        NstSvcInvitationFactory.get().then(function (invitations) {
          vm.invitations = invitations;
          resolve(invitations);
        }).catch(reject);
      });
    }

    function loadMore() {
      loadActivities();
    }

    function acceptInvitation(invitation) {
      NstSvcInvitationFactory.accept(invitation).then(function (result) {

      }).catch(function (result) {

      });
    }

    function declineInvitation(invitation) {
      NstSvcInvitationFactory.decline(invitation).then(function (result) {

      }).catch(function (result) {

      });
    }

    function applyFilter(filter) {
      vm.activitySettings.filter = vm.filters[filter].filter;
      loadActivities().then(function () {

      }).catch(function () {

      });
    }

    function viewPost(postId) {
      NstSvcPostFactory.getWithComments(postId).then(function (post) {
        // TODO: open a modal and show the post
      }).catch(function (error) {

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

    initialize().then(function (results) {
      console.log(vm.acts);
    }).catch(function (error) {

    });

  }

  /**
   * mapActivities - map a list of activities to a hierarchal form by date
   *
   * @param  {NstActivity}  acts   a flat list of activities
   * @return {Object}              a hierarchal form of activities
   */
  function mapActivities(acts) {
    var now = moment(),
        result = {
          min : null,
          max : null,
          years : {},
          thisYear : {}
        };
    var currentYearStart = now.startOf('year');
    var currentMonthStart = now.startOf('month');

    if (!acts || acts.length === 0) {
      return result;
    }

    result.min = moment.min(_.map(acts, 'date'));
    result.max = moment.max(_.map(acts, 'date'));

    var thisYearActs = _.filter(acts, function (act) {
      return act.date.isAfter(currentYearStart);
    });

    var thisMonthActs = _.filter(thisYearActs, function (act) {
      return act.date.isAfter(currentMonthStart);
    });

    var otherMontsActs = _.differenceBy(thisYearActs, thisMonthActs, 'id');

    result.thisYear = {
      min : year.startOf('year'),
      max : year.endOf('year'),
      thisMonth : mapThisMonthActs(thisMonthActs),
      otherMonths : groupByMonth(otherMontsActs)
    };

    var otherYearsActs = _.differenceBy(acts, thisYearActs, 'id');

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
    var yearGroups = _.groupBy(acts, function (act) {
      return act.year();
    });

    _.forIn(yearGroups, function (year, yearActs) {
      var yearMoment = yearActs[0].date;

      years[year] = {
        min : yearMoment.startOf('year'),
        max : yearMoment.endOf('year'),
        items : yearActs
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

    if (!acts || acts.length){
      return months;
    }

    var monthGroups = _.groupBy(acts, function (act) {
      return act.month();
    });

    _.forIn(monthGroups, function (month, monthActs) {
      var monthMoment = monthActs[0].date;

      months[month] = {
        min : monthMoment.startOf('month'),
        max : monthMoment.endOf('month'),
        items : monthActs
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
      min : null,
      max : null,
      today : {},
      days : {}
    };
    var now = moment();
    var todayStart = now.startOf('day');
    result.min = now.startOf('month');
    result.max = now.endOf('month');

    var todayActs = _.filter(thisYearActs, function (act) {
      return act.date.isAfter(todayStart);
    });

    result.today = {
      min : todayStart,
      max : now.endOf('day'),
      items : todayActs
    };

    var otherDaysActs = _.differenceBy(acts, todayActs, 'id');

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

    var dayGroups = _.groupBy(acts, function (act) {
      return act.date();
    });

    _.forIn(dayGroups, function (day, dayActs) {
      var dayMoment = dayActs[0].date;

      days[day] = {
        min : dayMoment.startOf('day'),
        max : dayMoment.endOf('day'),
        items : monthActs
      };

    });
    return days;
  }

})();
