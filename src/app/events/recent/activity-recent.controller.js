(function() {
  'use strict';

  angular
    .module('nested')
    .controller('RecentActivityController', RecentActivityController);

  /** @ngInject */
  function RecentActivityController($q,
                                    NstSvcLoader, NstSvcTry,
                                    NstSvcActivityFactory, NstSvcActivityMap,
                                    NstSvcPlaceFactory, NST_ACTIVITY_FACTORY_EVENT, NST_PLACE_ACCESS, NstFactoryError, NST_SRV_ERROR) {
    var vm = this;
    vm.activities = [];
    vm.status = {
      loadInProgress: true
    };

    NstSvcActivityFactory.addEventListener(NST_ACTIVITY_FACTORY_EVENT.ADD, function (e) {
      if (activityBelongsToPlace(e.detail)){
        addNewActivity(NstSvcActivityMap.toRecentActivity(e.detail));
      }
    });

    (function () {
      NstSvcLoader.inject(NstSvcTry.do(function () {
        var defer = $q.defer();

        var settings = {
          limit: vm.count || 10,
          placeId: null
        };

        if (vm.placeId || vm.place) {
          settings.placeId = vm.placeId || (vm.place ? vm.place.id : null);
        }

        if (settings.placeId) {
          return NstSvcPlaceFactory.hasAccess(settings.placeId, NST_PLACE_ACCESS.READ).then(function (has) {
            if (has) {
              return getRecentActivity(settings);
            } else {
              defer.reject();
            }
          })
        }else{
          return getRecentActivity(settings);
        }
      }));


    })();


    function getRecentActivity(settings) {

      var defer = $q.defer();

      NstSvcActivityFactory.getRecent(settings).then(function (activities) {
        vm.activities = mapActivities(activities);
        vm.status.loadInProgress = false;

        defer.resolve(vm.activities);
      }).catch(defer.reject);

      return defer.promise;
    }

    function mapActivities(activities) {
      return _.map(activities, NstSvcActivityMap.toRecentActivity);
    }

    function addNewActivity(activity) {
      if (vm.activities.length >= vm.count){
        vm.activities.pop();
      }
      vm.activities.unshift(activity);
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
