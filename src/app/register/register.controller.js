(function() {
  'use strict';

  angular
    .module('nested')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController(NstSvcAuth, $location) {
    var vm = this;

    if (NstSvcAuth.isInAuthorization()) {
      $location.path('/').replace();
    }
  }
})();

