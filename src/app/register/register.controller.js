(function() {
  'use strict';

  angular
    .module('nested')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController(AuthService, $location) {
    var vm = this;

    if (AuthService.isInAuthorization()) {
      $location.path('/').replace();
    }
  }
})();

