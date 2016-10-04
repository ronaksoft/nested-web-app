(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarPlaceInfoController', SidebarPlaceInfoController);

  /** @ngInject */
  function SidebarPlaceInfoController($q, $scope , $state, $stateParams, NstSvcLogger, NstSvcPlaceFactory,NstSvcPlaceMap,
    NST_DEFAULT, NstVmPlace) {
    var vm = this;
    vm.loading = false;


    function Initializing() {
      vm.loading = true;
      vm.children = [];

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
    };

    $scope.$watch(function () {
      return $stateParams.placeId.split('.')[0]
    },function () {
      Initializing();
    });

    function findGrandPlaceId(placeId) {
      return _.first(_.split(placeId, "."));
    }

    function stateParamIsProvided(parameter) {
      return !!parameter && parameter !== NST_DEFAULT.STATE_PARAM;
    }

    function getGrandPlaceChildren(grandPlaceId) {
      var deferred = $q.defer();
      NstSvcPlaceFactory.getGrandPlaceChildren(grandPlaceId).then(function (places) {
        var placesList =_.map(places, function (place) {
          var model = new NstVmPlace(place);
          model.href = $state.href('app.place-messages', { placeId : place.id });
          return model;
        });

        deferred.resolve(NstSvcPlaceMap.toTree(placesList));

      }).catch(deferred.reject);

      return deferred.promise;
    }

  }
})();
