(function() {
  'use strict';

  angular
    .module('nested')
    .controller('CreatePlaceController', CreatePlaceController);

  /** @ngInject */
  function CreatePlaceController($location, AuthService) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }
  }
})();
