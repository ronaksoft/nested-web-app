(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlacesController', PlacesController);

  /** @ngInject */
  function PlacesController($location, AuthService) {
    var vm = this;

    AuthService.isAuthenticated().catch(
      function () {
        $location.search({
          back: $location.$$absUrl
        });
        $location.path('/signin');
      }
    );
  }
})();
