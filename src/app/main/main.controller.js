(function() {
  'use strict';

  angular
    .module('nested')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($location, AuthService) {
    if (AuthService.isAuthenticated()) {
      $location.path('/events').replace();
    }
  }
})();
