(function() {
  'use strict';

  angular
    .module('nested')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($location, NstSvcAuth) {
    if (NstSvcAuth.isInAuthorization()) {
      $location.path('/messages').replace();
    }
  }

})();
