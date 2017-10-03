/**
 * @file src/app/activity/recent/activity-recent.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Recent activities of a place
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */

(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .controller('RecentActivityController', RecentActivityController);

  function RecentActivityController($q, _, $rootScope, $scope, $state, $stateParams, $timeout,
    NstSvcActivityFactory, NstSvcServer, NstSvcLogger,
    NstSvcPlaceFactory, NST_PLACE_ACCESS, NST_SRV_EVENT, NST_EVENT_ACTION) {
    var vm = this;
    var eventReferences = [];
    vm.activities = [];
    vm.openActivity = openActivity;
    vm.status = {
      loadInProgress: true
    };
    vm.settings = {
      limit: vm.count || 10,
      placeId: $stateParams.placeId
    };

    $timeout(initialize, 500);

    function initialize() {
      if (vm.settings.placeId) {
        // Waits for sidebar and messages page to get data and bind values
        // Loads the recent activities
        getRecentActivity(vm.settings);

        NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
          NstSvcLogger.debug('Retrieving recent activities right after reconnecting.');
          getRecentActivity(vm.settings);
        });
        // Listens to $rootScope and adds a new activity to the list
        _.forEach(NST_EVENT_ACTION, function (action) {
          eventReferences.push($rootScope.$on(action, function (e, data) {
            addNewActivity(data.activity);
          }));
        });
      }
    }

    function openActivity() {
      $state.go('app.place-activity', { placeId : vm.settings.placeId });
    }
    /**
     * Retrieves and binds the recent activities
     *
     * @param {any} settings
     * @returns
     */
    function getRecentActivity(settings) {
      NstSvcActivityFactory.getRecent(settings, handleCachedActivities).then(function (activities) {
        merge(activities);
        vm.status.loadInProgress = false;
      }).catch(function () {
        vm.status.loadInProgress = false;
      });
    }

    /**
     * Merges the received activities with the cached items
     *
     * @param {any} activities
     */
    function merge(activities) {
      var newItems = _.differenceBy(activities, vm.activities, 'id');
      var removedItems = _.differenceBy(vm.activities, activities, 'id');

      // first omit the removed items; The items that are no longer exist in fresh activities
      _.forEach(removedItems, function(item) {
        var index = _.findIndex(vm.activities, { 'id': item.id });
        if (index > -1) {
          vm.activities.splice(index, 1);
        }
      });

      // add new items; The items that do not exist in cached items, but was found in fresh activities
      vm.activities.unshift.apply(vm.activities, newItems);
    }

    /**
     * Binds the cached items
     *
     * @param {any} activities
     */
    function handleCachedActivities(activities) {
      vm.activities = activities;
      vm.status.loadInProgress = false;
    }

    /**
     * Insert a hot activity
     *
     * @param {any} activity
     */
    function addNewActivity(activity) {
      if (!_.some(vm.activities, { id : activity.id })) {
        if (vm.activities.length >= vm.count){
          // TODO: Do not pop an old activity if the hot one does not belongs to the place
          vm.activities.pop();
        }
        activity.isHot = true;
        // TODO: Sometimes a comment leakes! I've added || activity.type == NST_EVENT_ACTION.COMMENT_ADD
        // to prevent the leakage. But I'm not sure!
        if (activity.type == NST_EVENT_ACTION.POST_ADD || activity.type == NST_EVENT_ACTION.COMMENT_ADD) {
          if(activityBelongsToPlace(activity)){
            vm.activities.unshift(activity);
          }
        }else{
          vm.activities.unshift(activity);
        }
      }
    }

    /**
     * An activity belongs to the place when either both Ids are the same or the activity
     * represents a new post and the post has been sent to the place
     *
     * @param {any} activity
     * @returns
     */
    function activityBelongsToPlace(activity) {
      if (activity.place) {
        return activity.place.id === vm.settings.placeId;
      } else if (activity.post) {
        return _.some(activity.post.places, function (place) {
          return place.id === vm.settings.placeId;
        });
      } else if (activity.newPlace) {
        return activity.newPlace.id === vm.settings.placeId;
      } else if (activity.oldPlace) {
        return activity.oldPlace.id === vm.settings.placeId;
      }

      return false;
    }

    // Removes all event listeners
    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
