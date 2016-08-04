(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceAddMemberController', PlaceAddMemberController);

  /** @ngInject */
  function PlaceAddMemberController($location, $scope, $log,
    NstSvcServer, NstSvcAuth, NestedUser, NstSvcUserFactory,
    NST_PLACE_MEMBER_TYPE,
    chosenRole, currentPlace) {
    var vm = this;
    var defaultSearchResultCount = 9;

    vm.isTeamateMode = true;
    if (chosenRole === NST_PLACE_MEMBER_TYPE.KNOWN_GUEST) {
      vm.isTeamateMode = false;
    }
    vm.selectedUsers = [];
    vm.users = [];
    vm.search = _.debounce(search, 512);
    vm.add = add;

    function search(query) {
      var settings = {
        query : query,
        role : chosenRole,
        placeId : currentPlace.id,
        limit : calculateSearchLimit()
      };

      NstSvcUserFactory.search(settings).then(function (users) {
        vm.users = _.differenceBy(users, vm.selectedUsers, 'id');
      }).catch(function (error) {
        $log.debug(error);
      });
    };

    function add() {
      $scope.$close(vm.selectedUsers);
    };

    function calculateSearchLimit() {
      return defaultSearchResultCount + vm.selectedUsers.length;
    }
  }
})();
