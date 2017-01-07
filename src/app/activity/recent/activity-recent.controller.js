(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .controller('RecentActivityController', RecentActivityController);

  /** @ngInject */
  function RecentActivityController($q, $scope,
    NstSvcLoader, NstSvcActivityFactory, NstSvcActivityMap, NstSvcServer, NstSvcLogger,
    NstSvcPlaceFactory, NST_ACTIVITY_FACTORY_EVENT, NST_PLACE_ACCESS, NstFactoryError, NST_SRV_ERROR, NST_SRV_EVENT) {
    var vm = this;
    vm.activities = [];
    vm.status = {
      loadInProgress: true
    };
    vm.settings = {
      limit: vm.count || 10,
      placeId: null
    };


    NstSvcActivityFactory.addEventListener(NST_ACTIVITY_FACTORY_EVENT.ADD, function (e) {
      if (activityBelongsToPlace(e.detail)){
        addNewActivity(NstSvcActivityMap.toRecentActivity(e.detail));
      }
    });

    NstSvcServer.addEventListener(NST_SRV_EVENT.RECONNECT, function () {
      NstSvcLogger.debug('Retrieving recent activities right after reconnecting.');
      NstSvcLoader.inject(getRecentActivity(vm.settings));
    });


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
      } else {
        return NstSvcLoader.inject(getRecentActivity(vm.settings));
      }

    })();


    function getRecentActivity(settings) {

      var defer = $q.defer();

      NstSvcActivityFactory.getRecent(settings).then(function (activities) {
        vm.activities = mapActivities(activities);
        vm.status.loadInProgress = false;

        defer.resolve(vm.activities);
      }).catch(function (error) {
        vm.status.loadInProgress = false;
      });

      return defer.promise;
    }

    function mapActivities(activities) {
      return _.map(activities, NstSvcActivityMap.toRecentActivity);
    }

    function addNewActivity(activity) {
      if (!_.some(vm.activities, { id : activity.id })) {
        if (vm.activities.length >= vm.count){
          vm.activities.pop();
        }
        activity.isHot = true;
        vm.activities.unshift(activity);
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

  }
})();
