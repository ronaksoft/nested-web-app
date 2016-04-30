(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceOptionController', PlaceOptionController);

  /** @ngInject */
  function PlaceOptionController($location, AuthService, NestedPlace, $scope, $stateParams) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    if ($stateParams.hasOwnProperty('placeId')) {
      $scope.place = new NestedPlace($stateParams.placeId);
    } else {
      $location.path('/places').replace();
    }
  }
})();
