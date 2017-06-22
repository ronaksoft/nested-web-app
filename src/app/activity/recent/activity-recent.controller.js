(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .controller('RecentActivityController', RecentActivityController);

  /** @ngInject */
  function RecentActivityController($q, _, $rootScope, $scope, $state, $stateParams,
    NstSvcActivityFactory, NstSvcActivityMap, NstSvcServer, NstSvcLogger, NstSvcWait,
    NstSvcPlaceFactory, NST_ACTIVITY_FACTORY_EVENT, NST_PLACE_ACCESS, NstSvcSync, NST_SRV_EVENT, NST_EVENT_ACTION) {
    var vm = this;
    var eventReferences = [];
    vm.activities = [];
    vm.openActivity = openActivity;
    vm.status = {
      loadInProgress: true
    };
    vm.settings = {
      limit: vm.count || 10,
      placeId: $stateParams.placeId,
    };


    (function () {
      //
      // if (vm.placeId || vm.place) {
      //   vm.settings.placeId = vm.placeId || (vm.place ? vm.place.id : null);
      // }


      if (vm.settings.placeId) {
        NstSvcWait.all(['main-done'], function () {

          NstSvcPlaceFactory.get(vm.settings.placeId).then(function (place) {
            if (place.hasAccess(NST_PLACE_ACCESS.READ)) {
              getRecentActivity(vm.settings);

              NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
                NstSvcLogger.debug('Retrieving recent activities right after reconnecting.');
                getRecentActivity(vm.settings);
              });

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
    function getRecentActivity(settings) {

      var defer = $q.defer();

      NstSvcActivityFactory.getRecent(settings).then(function (activities) {
        // vm.activities = mapActivities(activities);
        vm.activities = activities;
        vm.status.loadInProgress = false;

        defer.resolve(vm.activities);
      }).catch(function (error) {
        vm.status.loadInProgress = false;
      });

      return defer.promise;
    }

    function addNewActivity(activity) {
      if (!_.some(vm.activities, { id : activity.id })) {
        if (vm.activities.length >= vm.count){
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

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
