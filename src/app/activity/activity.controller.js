/**
 * @file src/app/activity/recent/activity.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Activities of a place
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .controller('ActivityController', ActivityController);

  function ActivityController( $stateParams, $log, $state, $scope, $rootScope,
    _, moment,
    NST_SRV_EVENT, NST_PLACE_EVENT_ACTION, NST_ACTIVITY_FILTER, NST_DEFAULT, NstSvcAuth,
    NstSvcActivityMap,
    NstSvcDate, NST_PLACE_ACCESS,
    NstSvcActivityFactory, NstSvcSync, NstSvcServer, NstSvcPlaceAccess, NstSvcTranslation) {

    var vm = this;
    var eventReferences = [];

    vm.activities = [];
    vm.currentPlace = null;
    vm.noActivity = false;

    vm.loadMore = loadMore;
    vm.openContacts = openContacts;

    vm.expanded = true;

    vm.activitySettings = {
      limit: 24,
      filter: NST_ACTIVITY_FILTER.ALL,
      placeId: null,
      date: null
    };


    vm.tryAgainToLoadMore = false;
    vm.reachedTheEnd = false;
    vm.loading = false;
    vm.isSubPersonal = isSubPersonal;


    /******************
     ** Initializing **
     ******************/

    (function () {
      if (placeIdParamIsValid($stateParams.placeId)) {
        vm.activitySettings.placeId = $stateParams.placeId;
        NstSvcSync.openChannel($stateParams.placeId);
      } else {
        vm.activitySettings.placeId = null;
      }

      load();
      NstSvcPlaceAccess.getIfhasAccessToRead($stateParams.placeId).then(function(place) {
        vm.showPlaceId = !_.includes([ 'off', 'internal' ], place.privacy.receptive);
        vm.currentPlace = place;
        vm.currentPlaceLoaded = true;

        vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);

      });

    })();

    function openContacts($event) {
      $state.go('app.contacts', {}, {
        notify: false
      });
      $event.preventDefault();
    }

    /********************
     ** Main Functions **
     ********************/

    function loadMore() {
      if (vm.loading) {
        return false;
      }

      vm.loading = true;
      vm.tryAgainToLoadMore = false;
      NstSvcActivityFactory.get(vm.activitySettings).then(function (activities) {
        if (activities.length === 0 && !vm.activities.length === 0) {
          vm.reachedTheEnd = false;
          vm.noActivity = true;
        } else if (activities.length === 0 && vm.activities.length > 0) {
          vm.reachedTheEnd = true;
        } else {
          vm.reachedTheEnd = false;
          setLastActivityDate(activities);
          appendActivities(activities);
        }

        vm.loading = false;
        vm.tryAgainToLoadMore = false;

      }).catch(function (error) {
        vm.loading = false;
        vm.tryAgainToLoadMore = true;
        $log.debug(error);
      });
    }

    /**
     * Returns true if the place is a personal or sub-personal one
     *
     * @returns
     */
    function isSubPersonal() {
      if (vm.currentPlaceId)
        return NstSvcAuth.user.id == vm.currentPlaceId.split('.')[0];
    }
    /**
     * Retrieves after a the specified activity timestamp. Then merges them with the old ones.
     *
     * @param {any} date
     */
    function loadAfter(date) {
      vm.loading = true;
      vm.tryAgainToLoadMore = false;

      NstSvcActivityFactory.getAfter({
        placeId : vm.activitySettings.placeId,
        date : date,
        limit : vm.activitySettings.limit
      }).then(function(activities) {
        putInActivities(activities);
        vm.loading = false;
        vm.tryAgainToLoadMore = false;

      }).catch(function(error) {
        vm.loading = false;
        vm.tryAgainToLoadMore = true;
        $log.debug(error);
      });
    }

    /**********************
     ** Helper Functions **
     **********************/


    function mapActivities(activities) {
      return NstSvcActivityMap.toActivityItems(activities);
    }

    /**
     * Loads activities. Sets the last activity date and merges
     * the recieved items with the old ones.
     *
     * @returns
     */
    function load() {
      vm.loading = true;
      vm.tryAgainToLoadMore = false;
      NstSvcActivityFactory.get(vm.activitySettings, function(cachedActivities) {
        appendActivities(cachedActivities);
      }).then(function(activities) {
        if (activities.length === 0 && !vm.activities.length === 0) {
          vm.reachedTheEnd = false;
          vm.noActivity = true;
        } else {
          vm.reachedTheEnd = false;
          setLastActivityDate(activities);
          mergeWithActivities(activities);
        }

        vm.loading = false;
        vm.tryAgainToLoadMore = false;

      }).catch(function(error) {
        vm.loading = false;
        vm.tryAgainToLoadMore = true;
        $log.debug(error);
      });

    }

    /**
     * Maps and merge the given activities with the old ones
     * The method is used for loading more activities
     *
     * @param {any} activities
     */
    function appendActivities(activities) {
      return vm.activities = NstSvcActivityMap.appendGroup(vm.activities, activities);
    }

    function mergeWithActivities(activities) {
      return vm.activities = NstSvcActivityMap.mergeGroup(vm.activities, activities);
    }

    /**
     * Maps and merge the given activities with the old ones
     * * The method is used for merging recent activities
     * @param {any} activities
     */
    function putInActivities(activities) {
      return vm.activities = NstSvcActivityMap.putInGroup(vm.activities, activities);
    }

    /**
     * Stores the last activity date to be able to get older items. Also uses the current
     * moment if the given array is empty.
     *
     * @param {any} activities
     */
    function setLastActivityDate(activities) {
      var last = _.last(activities);
      vm.activitySettings.date = last ? last.date : NstSvcDate.now();
    }

    /**
     * Checks the given place Id not to be empty and not equals the default value
     *
     * @param {any}
     * @returns
     */
    function placeIdParamIsValid() {
      return !!$stateParams.placeId && $stateParams.placeId !== NST_DEFAULT.STATE_PARAM;
    }

    _.forEach(NST_PLACE_EVENT_ACTION, function (action) {
      eventReferences.push($rootScope.$on(action, function (e, data) {
        addNewActivity(data.activity);
      }));
    });
    eventReferences.push($scope.$on('scroll-reached-bottom', function () {
      vm.loadMore()
    }));

    // Request new activities everytime the socket reconnects to server
    NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
      loadAfter(getRecentActivityTime());
    });

    /**
     * Returns the most recent activity time. This returns 10 min passed time if the activity list is empty
     *
     * @returns
     */
    function getRecentActivityTime() {
      if (vm.activities.length > 0) {
        var latestActivity = _.head(vm.activities[0].items);
        if (latestActivity) {
          return latestActivity.date;
        }
      }

      return moment(NstSvcDate.now()).subtract(10, 'minute').valueOf();
    }

    /**
     * Decides whether to show the activity or not based on the page route and activity's place
     *
     * @param {any} activity
     * @returns
     */
    function activityBelongsToPlace(activity) {
      if (!vm.activitySettings.placeId) {
        return true;
      } else if (activity.place) {
        return activity.place.id === vm.activitySettings.placeId;
      } else if (activity.post) {
        return _.some(activity.post.places, function (place) {
          return place.id === vm.activitySettings.placeId;
        });
      }

      return false;
    }

    /**
     * Inserts the given activity in the right place if the activity must be shown here.
     *
     * @param {any} activity
     */
    function addNewActivity(activity) {
      // The activity must be placed in Today section definitely
      var todayGroupLabel = NstSvcTranslation.get("Today");

      var today = _.find(vm.activities, { date : todayGroupLabel });
      if (!today) {
        today = {
          date : todayGroupLabel,
          items : []
        };

        if (activity.type == NST_PLACE_EVENT_ACTION.POST_ADD){
          if(activityBelongsToPlace(activity)){
            vm.activities.unshift(today);
          }
        }else{
          vm.activities.unshift(today);
        }

      }

      if (!_.some(today.items, { id : activity.id })) {
        if (activity.type == NST_PLACE_EVENT_ACTION.POST_ADD){
          if(activityBelongsToPlace(activity)){
            today.items.unshift(activity);
          }
        }else{
          today.items.unshift(activity);
        }
      }
    }

    /**
     * The activity type must be related to the selected filter
     *
     * @param {any} activity
     * @returns
     */

    $scope.$on('$destroy', function () {
      NstSvcSync.closeChannel(vm.syncId);

      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

  }
})();
