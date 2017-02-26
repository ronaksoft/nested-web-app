(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('DisconnectedController', DisconnectedController);

  /** @ngInject */
  function DisconnectedController($state, $rootScope) {
    var vm = this;

    vm.signout = function () {
      $rootScope.modals['disconnected'].close();
      $state.go('app.signout');
    };

  }
})();
