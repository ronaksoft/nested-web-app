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

  /** @ngInject */
  /**
   * A component that displays the recent activities
   *
   * @param {any} $q
   * @param {any} _
   * @param {any} $rootScope
   * @param {any} $scope
   * @param {any} $state
   * @param {any} $stateParams
   * @param {any} NstSvcActivityFactory
   * @param {any} NstSvcActivityMap
   * @param {any} NstSvcServer
   * @param {any} NstSvcLogger
   * @param {any} NstSvcWait
   * @param {any} NstSvcPlaceFactory
   * @param {any} NST_ACTIVITY_FACTORY_EVENT
   * @param {any} NST_PLACE_ACCESS
   * @param {any} NstSvcSync
   * @param {any} NST_SRV_EVENT
   * @param {any} NST_EVENT_ACTION
   */
  function RecentActivityController($q, _, $rootScope, $scope, $state, $stateParams,
    NstSvcActivityFactory, NstSvcServer, NstSvcLogger, NstSvcWait,
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


    (function () {
      //
      // if (vm.placeId || vm.place) {
      //   vm.settings.placeId = vm.placeId || (vm.place ? vm.place.id : null);
      // }


      if (vm.settings.placeId) {
        // Waits for sidebar and messages page to get datat and bind values
        NstSvcWait.all(['main-done'], function () {
          // First of all, get the place and check if the user has READ access
          NstSvcPlaceFactory.get(vm.settings.placeId).then(function (place) {
            if (place.hasAccess(NST_PLACE_ACCESS.READ)) {
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
          });
        });
      }
    })();




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

      var defer = $q.defer();

      NstSvcActivityFactory.getRecent(settings).then(function (activities) {
        vm.activities = activities;
        vm.status.loadInProgress = false;

        defer.resolve(vm.activities);
      }).catch(function () {
        vm.status.loadInProgress = false;
      });

      return defer.promise;
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
