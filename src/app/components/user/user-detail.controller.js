(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('UserDetailCtrl', UserDetailCtrl);

  /** @ngInject */
  function UserDetailCtrl($q, $scope, $state, $stateParams, $uibModal, $log, $rootScope) {
    var vm = this;

    vm.user = JSON.parse(vm.user);
    vm.avatar = vm.user.avatar;
    vm.username = vm.user.username;
    vm.name = vm.user.name;
    

  }
})();
