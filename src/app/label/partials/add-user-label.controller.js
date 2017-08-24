(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('addUserLabelController', addUserLabelController);

  function addUserLabelController($timeout, $scope, $q, $uibModalInstance,
                                  toastr, _, NstSvcUserFactory, NST_USER_SEARCH_AREA,
                                  NstSvcLabelFactory, NstSvcTranslation, argv) {

    var vm = this;

    var defaultSearchResultCount = 9;

    vm.lastSelectedUsers = [];
    vm.selectedUsers = [];
    vm.users = [];
    vm.search = _.debounce(search, 512);
    vm.add = add;
    vm.query = '';
    vm.limit = 100;
    vm.searchPlaceholder = 'Add Holders';

    if (argv.selectedUser) {
      vm.lastSelectedUsers = argv.selectedUser;
    }

    search();

    function add() {
      $scope.$close(vm.selectedUsers);
    }

    function search(query) {
      var settings = {
        query: query,
        limit: calculateSearchLimit()
      };

      NstSvcUserFactory.search(settings, NST_USER_SEARCH_AREA.ACCOUNTS)
        .then(function (users) {
          users = _.unionBy(users, 'id');
          var tempUsers = vm.lastSelectedUsers.concat(vm.selectedUsers);
          tempUsers = _.unionBy(tempUsers, 'id');
          vm.users = _.differenceBy(users, tempUsers, 'id');
          if (_.isString(query)
            && _.size(query) >= 4
            && _.indexOf(query, " ") === -1
            && !_.some(vm.users, { id : query })) {

            var initProfile = NstSvcUserFactory.parseTinyUser({
              _id: settings.query,
              fname: settings.query
            });
            vm.users.push(initProfile);
          }
          vm.query = query;
        })
        .catch(function () {
        });
    }

    function calculateSearchLimit() {
      return defaultSearchResultCount + vm.selectedUsers.length;
    }
  }

})();
