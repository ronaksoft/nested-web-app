(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceAddMemberController', PlaceAddMemberController);

  /** @ngInject */
  function PlaceAddMemberController($scope, $log,
                                    NST_USER_SEARCH_AREA,
                                    NstSvcUserFactory, NstSvcTranslation,
                                    NST_PLACE_MEMBER_TYPE,
                                    chosenRole, currentPlace, mode, isForGrandPlace) {
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


    if (isForGrandPlace === true) {
      vm.isGrandPlace = true;
    } else if (isForGrandPlace === false) {
      vm.isGrandPlace = false;
    } else {
      if (currentPlace.id.split('.').length > 1) {
        vm.isGrandPlace = false;
      } else {
        vm.isGrandPlace = true;
      }
    }


    if (vm.isGrandPlace) {
      vm.searchPlaceholder = NstSvcTranslation.get("Name, email or phone number...");
    } else {
      vm.searchPlaceholder = NstSvcTranslation.get("Name or ID...");
    }

    function search(query) {

      var settings = {
        query: query,
        // role is no longer supported
        // role: chosenRole,
        placeId: currentPlace.id,
        limit: calculateSearchLimit()
      };

      if (mode === 'offline-mode' && isForGrandPlace) {
        delete  settings.placeId;
      }

      NstSvcUserFactory.search(settings, (vm.isGrandPlace || isForGrandPlace) ? NST_USER_SEARCH_AREA.INVITE : NST_USER_SEARCH_AREA.ADD)
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
      var previousUsers = mode === 'offline-mode' ? 0 : currentPlace.counters.creators + currentPlace.counters.key_holders;
      vm.limit = 255 - previousUsers;
    }
  }
})();
