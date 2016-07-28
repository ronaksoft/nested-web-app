(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceAddMemberController', PlaceAddMemberController);

  /** @ngInject */
  function PlaceAddMemberController($location, $scope, NstSvcServer, NstSvcAuth, NestedUser, MEMBER_TYPE) {
    var vm = this;

    if (!NstSvcAuth.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    vm.selectedUsers = [];

    vm.search = function (query) {
      NstSvcServer.request('account/search', {
        keyword: query,
        place_id: $scope.place.id,
        role: 'teammate' == $scope.role ? MEMBER_TYPE.KEY_HOLDER : MEMBER_TYPE.KNOWN_GUEST,
        limit: 10 + vm.selectedUsers.length
      }).then(function (data) {
        $scope.place_add_member.users = [];
        for (var k in data.accounts) {
          $scope.place_add_member.users.push(new NestedUser(data.accounts[k]));
        }
      });
    };

    vm.add = function () {
      for (var k in $scope.place_add_member.selectedUsers) {
        var user = $scope.place_add_member.selectedUsers[k];

        switch ($scope.role) {
          case 'teammate':
            $scope.place.addMember('key_holder', user, true);
            break;

          case 'member':
          default:
            $scope.place.addMember('known_guest', user, true);
            break;
        }
      }

      $scope.closeModal();
    };
  }
})();
