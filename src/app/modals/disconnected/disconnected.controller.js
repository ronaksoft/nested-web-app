(function() {
  'use strict';

  angular
    .module('nested')
    .controller('DisconnectedController', DisconnectedController);

  /** @ngInject */
  function DisconnectedController($q, $state, $rootScope, NstSvcAuth) {
    var vm = this;

    vm.signout = function () {
      return NstSvcAuth.logout().then(function () {
        $state.go('home');
        $rootScope.modals['disconnected'].close();

        return $q(function (res) {
          res();
        });
      });
    };
  }
})();
