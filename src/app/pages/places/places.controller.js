(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlacesController', PlacesController);

  /** @ngInject */
  function PlacesController($q, $scope, $state, $stateParams, $location,
                            NstSvcLoader, NstSvcPlaceFactory) {
    var vm = this;

    $q.all([getMyPlaces()]).then(function (resolvedSet) {
      vm.places = mapPlaces(resolvedSet[0]);
    });

    /*****************************
     *****    Fetch Methods   ****
     *****************************/

    function getMyPlaces() {
      return NstSvcLoader.inject(NstSvcPlaceFactory.getMyTinyPlaces());
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    function mapPlaces(places, depth) {
      depth = depth || 0;

      var placesClone = Object.keys(places).filter(function (k) { return 'length' !== k; }).map(function (k, i, arr) {
        var place = places[k];
        place.depth = depth;
        // place.url = $state.href(getPlaceFilteredState(), { placeId: place.getId() });
        place.isCollapsed = true;
        place.isFirstChild = 0 == i;
        place.isLastChild = (arr.length - 1) == i;
        place.children = mapPlaces(place.children, depth + 1);

        return place;
      });

      return placesClone;
    }
  }
})();
