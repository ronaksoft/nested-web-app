(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('UserDetailCtrl', UserDetailCtrl);

  /** @ngInject */
  function UserDetailCtrl($q, $scope, $state, $stateParams, $uibModal, NstSearchQuery, $rootScope) {
    var vm = this;

    vm.user = JSON.parse(vm.user);
    vm.avatar = vm.user.avatar;
    vm.username = vm.user.username;
    vm.name = vm.user.name;

    vm.searchUser = function () {
      var query =  '@' + vm.username;
      var searchQury = new NstSearchQuery(query);
      $state.go('app.search', { search : NstSearchQuery.encode(searchQury.toString()) });
    };

    vm.messageUser = function () {
      $state.go('app.compose', {placeId: vm.username});
    }


  }
})();
