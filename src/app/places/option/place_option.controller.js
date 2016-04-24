(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceOptionController', PlaceOptionController);

  /** @ngInject */
  function PlaceOptionController($location, AuthService, NestedPlace, $scope) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    this.place = null;
    var query = $location.search();
    if (query.hasOwnProperty('id')) {
      this.place = new NestedPlace(query.id);
    } else {
      $location.path('/places').replace();
    }
  }
})();
