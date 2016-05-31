(function() {
  'use strict';

  angular
    .module('nested')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $interval) {
    $rootScope.rexExt = /(?:\.([^.]+))?$/;

    $rootScope.now = new Date();
    $interval(function () {
      $rootScope.now.setTime(Date.now());
    }, 1000);

    // TODO: Add Event Listener on AuthService: AUTH_EVENTS.UNAUTHENTICATE => Redirect to here
  }

})();
