(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceOptionController', PlaceOptionController);

  /** @ngInject */
  function PlaceOptionController($location, AuthService) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }
  }
})();
