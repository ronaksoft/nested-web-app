(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceAddMemberController', PlaceAddMemberController);

  /** @ngInject */
  function PlaceAddMemberController($location, $scope, $log,
    NstSvcServer, NstSvcAuth, NstSvcUserFactory,
    NST_PLACE_MEMBER_TYPE,
    chosenRole, currentPlace) {
    var vm = this;
    var defaultSearchResultCount = 9;

    vm.isTeammateMode = true;
    vm.isGrandPlace = false;

    if (chosenRole === NST_PLACE_MEMBER_TYPE.KNOWN_GUEST) {
      vm.isTeammateMode = false;
    }

    if (!currentPlace.parent || !currentPlace.parent.id){
      vm.isGrandPlace = true;
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
    }

    function add() {
      $scope.$close(vm.selectedUsers);
    }

    function calculateSearchLimit() {
      return defaultSearchResultCount + vm.selectedUsers.length;
    }
  }
})();
