(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('DisconnectedController', DisconnectedController);

  /** @ngInject */
  function DisconnectedController($q, $state, $rootScope, NstSvcAuth) {
    var vm = this;

    vm.signout = function () {
      $rootScope.modals['disconnected'].close();
      $state.go('public.signout');
    };
  }
})();
