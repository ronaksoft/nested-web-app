(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostviewController', postviewController);

  /** @ngInject */
  function postviewController($location, AuthService) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }
  }
})();
