(function() {
  'use strict';

  angular
    .module('nested')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController(AuthService, $location) {
    var vm = this;

    AuthService.isAuthenticated(function () { $location.path('/').replace() });
  }
})();

