(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarPlaceInfoController', SidebarPlaceInfoController);

  /** @ngInject */
  function SidebarPlaceInfoController($q, $state, $stateParams, NstSvcLogger, NstSvcPlaceFactory,
    NST_DEFAULT, NstVmPlace) {
    var vm = this;
    vm.loading = false;

    // Initializing
    (function() {
      vm.loading = true;

      if (!stateParamIsProvided($stateParams.placeId)) {
        NstSvcLogger.info('Could not find placeId parameter in state url');
        return;
      }

      var grandPlaceId = findGrandPlaceId($stateParams.placeId);

      getGrandPlaceChildren(grandPlaceId).then(function (places) {
        console.log('viewmodels', places);
        vm.children = places;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.loading = false;
      });

    })();

    function findGrandPlaceId(placeId) {
      return _.first(_.split(placeId, "."));
    }

    function stateParamIsProvided(parameter) {
      return !!parameter && parameter !== NST_DEFAULT.STATE_PARAM;
    }

    function getGrandPlaceChildren(grandPlaceId) {
      var deferred = $q.defer();
      NstSvcPlaceFactory.getGrandPlaceChildren(grandPlaceId).then(function (places) {
        deferred.resolve(_.map(places, function (place) {
          var model = new NstVmPlace(place);
          model.href = $state.href('app.place-messages', { placeId : place.id });

          return model;
        }));

      }).catch(deferred.reject);

      return deferred.promise;
    }

  }
})();
