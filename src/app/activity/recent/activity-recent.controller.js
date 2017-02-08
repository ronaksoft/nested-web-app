(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .controller('RecentActivityController', RecentActivityController);

  /** @ngInject */
  function RecentActivityController($q, _, $scope,
    NstSvcLoader, NstSvcActivityFactory, NstSvcActivityMap, NstSvcServer, NstSvcLogger,
    NstSvcPlaceFactory, NST_ACTIVITY_FACTORY_EVENT, NST_PLACE_ACCESS, NstSvcSync, NST_SRV_EVENT, NST_EVENT_ACTION) {
    var vm = this;
    var eventListeners = [];
    vm.activities = [];
    vm.status = {
      loadInProgress: true
    };
    vm.settings = {
      limit: vm.count || 10,
      placeId: null
    };

    (function () {

      if (vm.placeId || vm.place) {
        vm.settings.placeId = vm.placeId || (vm.place ? vm.place.id : null);
      }

      if (vm.settings.placeId) {
        return NstSvcLoader.inject(NstSvcPlaceFactory.get(vm.settings.placeId)).then(function (place) {
          if (place.hasAccess(NST_PLACE_ACCESS.READ)) {
            return NstSvcLoader.inject(getRecentActivity(vm.settings));
          }
        });
      }

      NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
        NstSvcLogger.debug('Retrieving recent activities right after reconnecting.');
        NstSvcLoader.inject(getRecentActivity(vm.settings));
      });

    })();



    eventListeners = _.map(NST_EVENT_ACTION,function (val) {

      return NstSvcSync.addEventListener(val, function (e) {
        addNewActivity(e.detail);
      });
    });


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

        if (activity.type == NST_EVENT_ACTION.POST_ADD){
          if(activityBelongsToPlace(activity)){
            vm.activities.unshift(activity);
          }
        }else{
          vm.activities.unshift(activity);
        }
      }
    }

    function activityBelongsToPlace(activity) {
      if (!vm.placeId) {
        return true;
      } else if (activity.place) {
        return activity.place.id === vm.placeId;
      } else if (activity.post) {
        return _.some(activity.post.places, function (place) {
          return place.id === vm.placeId;
        });
      }

      return false;
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventListeners, function (eventId) {
        NstSvcSync.removeEventListener(eventId);
      });
    });

  }
})();
