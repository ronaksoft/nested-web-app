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
          back: window.location.href
        });
        $location.path('/signin');
      }
    );
  }
})();
