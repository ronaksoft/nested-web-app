(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceAddMemberController', PlaceAddMemberController);

  /** @ngInject */
  function PlaceAddMemberController($scope, $log,
                                    NST_USER_SEARCH_AREA,
                                    NstSvcUserFactory,
                                    NST_PLACE_MEMBER_TYPE,
                                    chosenRole, currentPlace) {
    var vm = this;
    var defaultSearchResultCount = 9;

    vm.isTeammateMode = true;
    vm.selectedUsers = [];
    vm.users = [];
    vm.search = _.debounce(search, 512);
    vm.add = add;
    vm.query = '';
    checkUserLimitPlace();
    search();


    if (currentPlace.id.split('.').length > 1){
      vm.isGrandPlace = false;
    }else{
      vm.isGrandPlace = true;
    }




    function search(query) {
      var settings = {
        query : query || vm.query,
        role : chosenRole,
        placeId : currentPlace.id,
        limit : calculateSearchLimit()
      };


      NstSvcUserFactory.search(settings, vm.isGrandPlace ?  NST_USER_SEARCH_AREA.INVITE :  NST_USER_SEARCH_AREA.ADD)
        .then(function (users) {
          vm.users = _.differenceBy(users, vm.selectedUsers, 'id');
          vm.query = query;
        })
        .catch(function (error) {
          $log.debug(error);
        });
    }

    function add() {
      $scope.$close(vm.selectedUsers);
    }

    function calculateSearchLimit() {
      return defaultSearchResultCount + vm.selectedUsers.length;
    }

    function checkUserLimitPlace() {
      var previusUsers = currentPlace.counters.creators + currentPlace.counters.key_holders;
      vm.limit = 255 - previusUsers;
    }
  }
})();
