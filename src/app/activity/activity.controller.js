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

  /** @ngInject */
  /**
   * Activities page controller
   *
   * @param {any} $q
   * @param {any} $stateParams
   * @param {any} $log
   * @param {any} $state
   * @param {any} $scope
   * @param {any} $rootScope
   * @param {any} _
   * @param {any} moment
   * @param {any} NST_SRV_EVENT
   * @param {any} NST_EVENT_ACTION
   * @param {any} NST_ACTIVITY_FILTER
   * @param {any} NST_DEFAULT
   * @param {any} NstSvcActivityMap
   * @param {any} NstSvcModal
   * @param {any} NstSvcActivitySettingStorage
   * @param {any} NstSvcActivityFactory
   * @param {any} NstSvcSync
   * @param {any} NstSvcInvitationFactory
   * @param {any} NstSvcServer
   * @param {any} NstUtility
   * @param {any} NstSvcPlaceAccess
   * @param {any} NstSvcTranslation
   * @param {any} NstSvcInteractionTracker
   */
  function ActivityController( $stateParams, $log, $state, $scope, $rootScope,
    _, moment,
    NST_SRV_EVENT, NST_EVENT_ACTION, NST_ACTIVITY_FILTER, NST_DEFAULT,
    NstSvcActivityMap, NstSvcModal,
    NstSvcActivitySettingStorage, NstSvcDate,
    NstSvcActivityFactory, NstSvcSync, NstSvcServer, NstUtility, NstSvcPlaceAccess, NstSvcTranslation, NstSvcInteractionTracker) {

    var vm = this;
    var activityFilterGroups = {};
    var eventReferences = [];

    vm.activities = [];
    vm.currentPlace = null;
    vm.noActivity = false;
    vm.loadMoreCounter = 0;

    vm.loadMore = loadMore;
    vm.applyFilter = applyFilter;
    vm.toggleViewMode = toggleViewMode;

    vm.expanded = true;

    vm.activitySettings = {
      limit: 24,
      filter: NST_ACTIVITY_FILTER.ALL,
      placeId: null,
      date: null
    };

    vm.filterDictionary = {};

    vm.urls = {
      filters: {
        all: '',
        messages: '',
        comments: '',
        logs: ''
      }
    };


    vm.tryAgainToLoadMore = false;
    vm.reachedTheEnd = false;
    vm.loading = false;


    /******************
     ** Initializing **
     ******************/

    (function () {
      // Every filter group contains some sort of activities
      activityFilterGroups[NST_ACTIVITY_FILTER.MESSAGES] = [
        NST_EVENT_ACTION.POST_ADD,
        NST_EVENT_ACTION.POST_COPY,
        NST_EVENT_ACTION.POST_RETRACT,
        NST_EVENT_ACTION.POST_UPDATE,
        NST_EVENT_ACTION.POST_ATTACH_PLACE,
        NST_EVENT_ACTION.POST_REMOVE_PLACE,
        NST_EVENT_ACTION.POST_MOVE
      ];
      activityFilterGroups[NST_ACTIVITY_FILTER.COMMENTS] = [
        NST_EVENT_ACTION.COMMENT_ADD,
        NST_EVENT_ACTION.COMMENT_REMOVE
      ];

      activityFilterGroups[NST_ACTIVITY_FILTER.LABEL] = [
        NST_EVENT_ACTION.LABEL_ADD,
        NST_EVENT_ACTION.LABEL_REMOVE
      ];

      activityFilterGroups[NST_ACTIVITY_FILTER.LOGS] = [
        NST_EVENT_ACTION.MEMBER_REMOVE,
        NST_EVENT_ACTION.MEMBER_JOIN,
        NST_EVENT_ACTION.PLACE_ADD
      ];

      vm.filterDictionary[NST_ACTIVITY_FILTER.ALL] = NstSvcTranslation.get("All");
      vm.filterDictionary[NST_ACTIVITY_FILTER.MESSAGES] = NstSvcTranslation.get("Messages");
      vm.filterDictionary[NST_ACTIVITY_FILTER.COMMENTS] = NstSvcTranslation.get("Comments");
      vm.filterDictionary[NST_ACTIVITY_FILTER.LOGS] = NstSvcTranslation.get("Logs");
      vm.filterDictionary[NST_ACTIVITY_FILTER.LABEL] = NstSvcTranslation.get("labels");


      if (placeIdParamIsValid($stateParams.placeId)) {
        vm.activitySettings.placeId = $stateParams.placeId;
        NstSvcSync.openChannel($stateParams.placeId);
      } else {
        vm.activitySettings.placeId = null;
      }

      // First looks for filter in URL. Stores the value, if any filter was provided in URL.
      if (!$stateParams.filter || $stateParams.filter === NST_DEFAULT.STATE_PARAM) {
        vm.activitySettings.filter = NstSvcActivitySettingStorage.get('filter') || NST_ACTIVITY_FILTER.ALL;
      } else {
        if (filterIsValid($stateParams.filter)) {
          vm.activitySettings.filter = $stateParams.filter;
          NstSvcActivitySettingStorage.set('filter', vm.activitySettings.filter);
        } else {
          vm.activitySettings.filter = NST_ACTIVITY_FILTER.ALL;
        }
      }

      // Reads activitySettings.collapsed from local storage
      vm.expanded = !NstSvcActivitySettingStorage.get('collapsed');

      generateUrls();
      // Retrieves a place with the given Id, if the user has required accesses. Then loads the place activities
      NstSvcPlaceAccess.getIfhasAccessToRead($stateParams.placeId).then(function (place) {
        if (place) {
          vm.currentPlace = place;
          vm.currentPlaceLoaded = true;
          vm.showPlaceId = !_.includes([ 'off', 'internal' ], place.privacy.receptive);
          return loadActivities();
        } else {
          NstSvcModal.error(NstSvcTranslation.get("Error"), NstSvcTranslation.get("Either this Place doesn't exist, or you don't have the permit to enter the Place.")).finally(function () {
            $state.go(NST_DEFAULT.STATE);
          });
        }
      }).catch(function (error) {
        $log.debug(error);
      });

    })();


    /********************
     ** Main Functions **
     ********************/

    function loadMore() {
      // TODO: loadMoreCounter is not used! remove it and the next tracking line
      vm.loadMoreCounter ++;
      NstSvcInteractionTracker.trackEvent('activities', 'load more', vm.loadMoreCounter);
      loadActivities();
    }

    /**
     * Applies the given filter by navigating to the related route
     *
     * @param {any} filter
     */
    function applyFilter(filter) {
      if (vm.activitySettings.placeId) {
        $state.go('app.place-activity-filtered', {
          placeId: vm.activitySettings.placeId,
          filter: filter
        }, { notify : false });
      } else {
        $state.go('app.activity-filtered', {
          filter: filter
        }, { notify : false });
      }
    }

    /**
     * Toggles expanded/collapsed views
     *
     */
    function toggleViewMode() {
      vm.expanded = !vm.expanded;
      NstSvcActivitySettingStorage.set('collapsed', !vm.expanded);
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
    function loadActivities() {
      if (vm.loading) {
        return false;
      }

      vm.loading = true;
      vm.tryAgainToLoadMore = false;
      NstSvcActivityFactory.get(vm.activitySettings).then(function(activities) {
        if (activities.length === 0 && !vm.activities.length === 0) {
          vm.reachedTheEnd = false;
          vm.noActivity = true;
        } else if (activities.length === 0 && vm.activities.length > 0) {
          vm.reachedTheEnd = true;
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
    function mergeWithActivities(activities) {
      var activityGroups = mapActivities(activities);
      _.forEach(activityGroups, function (targetGroup) {
        var sourceGroup = _.find(vm.activities, { date : targetGroup.date });
        if (sourceGroup) { // merge
          sourceGroup.items.push.apply(sourceGroup.items, targetGroup.items);
        } else { // add
          vm.activities.push(targetGroup);
        }
      });
    }

    /**
     * Maps and merge the given activities with the old ones
     * * The method is used for merging recent activities
     * @param {any} activities
     */
    function putInActivities(activities) {
      var activityGroups = mapActivities(activities);
      _.forEachRight(activityGroups, function (targetGroup) {
        var sourceGroup = _.find(vm.activities, { date : targetGroup.date });
        if (sourceGroup) { // merge
          _.forEach(targetGroup.items, function (item) {
            if (!_.some(sourceGroup.items, { id : item.id })) {
              sourceGroup.items.unshift(item);
            }
          });
        } else { // add
          vm.activities.unshift(targetGroup);
        }
      });
    }

    /**
     * Stores the last activity date to be able to get older items. Also uses the current
     * moment if the given array is empty.
     *
     * @param {any} activities
     */
    function setLastActivityDate(activities) {
      var last = _.last(activities);
      var lastDate = last ? last.date : moment(NstSvcDate.now());

      vm.activitySettings.date = NstUtility.date.toUnix(lastDate);
    }

    /**
     * The given filter should be predefined. Returns true if the filter exists in the list.
     *
     * @param {any} value
     * @returns
     */
    function filterIsValid(value) {
      return _.includes(_.values(NST_ACTIVITY_FILTER), value);
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

    /**
     * Generates different URLs for every filters
     *
     */
    function generateUrls() {
      if (vm.activitySettings.placeId) {
        vm.urls.filters = {
          all: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.ALL }),
          messages: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.MESSAGES }),
          comments: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.COMMENTS }),
          logs: $state.href('app.place-activity-filtered', {placeId: vm.activitySettings.placeId, filter: NST_ACTIVITY_FILTER.LOGS })
        };
      } else {
        vm.urls.filters = {
          all: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.ALL }),
          messages: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.MESSAGES }),
          comments: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.COMMENTS }),
          logs: $state.href('app.activity-filtered', {filter: NST_ACTIVITY_FILTER.LOGS })
        };
      }
    }



    _.forEach(NST_EVENT_ACTION, function (action) {
      eventReferences.push($rootScope.$on(action, function (e, data) {
        addNewActivity(data.activity);
      }));
    });

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
      var date = moment(NstSvcDate.now()).subtract(10, 'minute');

      if (vm.activities.length > 0) {
        var latestActivity = _.head(vm.activities[0].items);
        if (latestActivity) {
          date = latestActivity.date;
        }
      }

      return NstUtility.date.toUnix(date);
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

        if (activity.type == NST_EVENT_ACTION.POST_ADD){
          if(activityBelongsToPlace(activity)){
            vm.activities.unshift(today);
          }
        }else{
          vm.activities.unshift(today);
        }

      }

      if (!_.some(today.items, { id : activity.id })) {
        if (activity.type == NST_EVENT_ACTION.POST_ADD){
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

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
