(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceAddMemberController', PlaceAddMemberController);

  /** @ngInject */
  function PlaceAddMemberController($location, $scope, WsService, AuthService, NestedUser) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    vm.selectedUsers = [];

    vm.search = function (query) {
      WsService.request('account/search', { keyword: query }).then(function (data) {
        $scope.place_add_member.users = [];
        for (var k in data.accounts) {
          $scope.place_add_member.users.push(new NestedUser(data.accounts[k]));
        }
      });
    };

    vm.add = function () {
      for (var k in $scope.place_add_member.selectedUsers) {
        var user = $scope.place_add_member.selectedUsers[k];
        console.log(user);

        switch ($scope.role) {
          case 'teammate':
            $scope.place.addMember('key_holder', user);
            break;

          case 'member':
          default:
            $scope.place.addMember('known_guest', user);
            break;
        }
      }

      $scope.closeModal();
    };
  }
})();
