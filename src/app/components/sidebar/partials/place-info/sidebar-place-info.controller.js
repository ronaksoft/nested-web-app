(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('SidebarPlaceInfoController', SidebarPlaceInfoController);

  /** @ngInject */
  function SidebarPlaceInfoController($q, $scope , $state, $stateParams, NstSvcLogger, NstSvcPlaceFactory,NstSvcPlaceMap,
                                      NST_PLACE_FACTORY_EVENT,NST_DEFAULT, NstVmPlace) {
    var vm = this;
    vm.loading = false;


    function Initializing() {

      vm.loading = true;
      vm.children = [];

      if (!stateParamIsProvided($stateParams.placeId)) {
        NstSvcLogger.info('Could not find placeId parameter in state url');
        return;
      }

      var grandPlaceId = $scope.ctlPlaceInfo.grandPlace.id;
      getGrandPlaceChildren(grandPlaceId).then(function (places) {
        vm.children = places;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.loading = false;
      });
    };


    $scope.$watch(function () {
      return $stateParams.placeId;
    },function () {
      vm.currentPlaceId = $stateParams.placeId;
    });


    $scope.$watch(function () {
      if ($scope.ctlPlaceInfo.grandPlace) {
        return $scope.ctlPlaceInfo.grandPlace.id;
      }else{
        return false
      }
    },function () {
      if ($scope.ctlPlaceInfo.grandPlace) {
        Initializing();
      }
    });

    function findGrandPlaceId(placeId) {
      return _.first(_.split(placeId, "."));
    }

    function stateParamIsProvided(parameter) {
      return !!parameter && parameter !== NST_DEFAULT.STATE_PARAM;
    }

    function getSubplaceInfo(grandPlaceId){
      var deferred = $q.defer();

      NstSvcPlaceFactory.get(grandPlaceId).then(function (place) {
        deferred.resolve(new NstVmPlace(place))
      }).catch(deferred.reject);

      return deferred.promise;

    }

    function getGrandPlaceChildren(grandPlaceId) {
      var deferred = $q.defer();
      NstSvcPlaceFactory.getGrandPlaceChildren(grandPlaceId).then(function (places) {
        var placesList =_.map(places, function (place) {
          var model = new NstVmPlace(place);
          model.isStarred = place.isStarred;
          model.href = $state.href('app.place-messages', { placeId : place.id });
          return model;
        });

        deferred.resolve(NstSvcPlaceMap.toTree(placesList, $stateParams.placeId));

      }).catch(deferred.reject);

      return deferred.promise;
    }


    /*****************************
     *****  Event Listeners   ****
     *****************************/

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.SUB_ADD, function (event) {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.addPlaceToTree(vm.children, mapPlace(event.detail.place));
      Initializing();
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.UPDATE, function (event) {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.updatePlaceInTree(vm.children, mapPlace(event.detail.place));

      Initializing();
    });


    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.REMOVE, function (event) {
      //TODO:: change children without Initializing()
      // NstSvcPlaceFactory.removePlaceInTree(vm.children, mapPlace(event.detail.place));
      Initializing();
    });



  }
})();
