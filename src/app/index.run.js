(function() {
  'use strict';

  angular
    .module('nested')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $interval) {
    $rootScope.now = new Date();
    $interval(function () {
      $rootScope.now.setTime(Date.now());
    }, 1000);
  }

})();
