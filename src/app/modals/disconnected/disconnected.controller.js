(function() {
  'use strict';

  angular
    .module('nested')
    .controller('DisconnectedController', DisconnectedController);

  /** @ngInject */
  function DisconnectedController($q, $state, $rootScope, NstSvcAuth) {
    var vm = this;

    vm.signout = function () {
      $rootScope.modals['disconnected'].close();
      $state.go('signout');
    };
  }
})();
