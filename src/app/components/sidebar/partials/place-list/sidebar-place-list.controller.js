(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarPlaceListController', SidebarPlaceListController);

  /** @ngInject */
  function SidebarPlaceListController($q, NstSvcPlaceFactory, NstSvcLogger, NstVmPlace) {
    var vm = this;

    vm.loading = false;

    // Initialize
    (function () {
      vm.loading = true;

      getGrandPlaces().then(function (places) {
        vm.places = places;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.loading = false;
      });

    })();

    function getGrandPlaces() {
      var deferred = $q.defer();

      NstSvcPlaceFactory.getGrandPlaces().then(function (places) {
        deferred.resolve(mapPlaces(places));
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function mapPlaces(places) {
      return _.map(places, function (place) {
        return new NstVmPlace(place);
      });
    }
  }
})();
