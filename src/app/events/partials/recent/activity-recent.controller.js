(function() {
  'use strict';

  angular
    .module('nested')
    .controller('RecentActivityController', RecentActivityController);

  /** @ngInject */
  function RecentActivityController($scope, $log, toastr, $q,
    NstSvcLoader, NstSvcTry,
    NstSvcActivityFactory, NstSvcActivityMap,
    NST_ACTIVITY_FACTORY_EVENT) {
    var vm = this;
    vm.activities = [];

    NstSvcActivityFactory.addEventListener(NST_ACTIVITY_FACTORY_EVENT.ADD, function (e) {
      console.log(e);
      addNewActivity(NstSvcActivityMap.toRecentActivity(e.detail.object));
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

        NstSvcActivityFactory.getRecent(settings).then(function (activities) {
          vm.activities = mapActivities(activities);
          defer.resolve(vm.activities);
        }).catch(defer.reject);

        return defer.promise;
      }));
    })();


    function mapActivities(activities) {
      return _.map(activities, NstSvcActivityMap.toRecentActivity);
    }

    function addNewActivity(activity) {
      vm.activities.pop();
      vm.activities.unshift(activity);
    }

  }
})();
