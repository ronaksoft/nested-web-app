(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('createLabelController', createLabelController);

  function createLabelController($scope, $q, $uibModalInstance,
    toastr, _, NstSvcLabelFactory, NstSvcUserFactory, NST_USER_SEARCH_AREA, NstSvcTranslation) {

    var vm = this;
    vm.code = 'A';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holderType = 'all';
    vm.specificHolders = [];
    vm.title = '';

    var defaultSearchResultCount = 9;
    vm.users = [];
    vm.search = _.debounce(search, 512);
    vm.query = '';
    vm.limit = 100;

    vm.isNotValid = isNotValid;
    vm.createLabel = createLabel;

    function isNotValid() {
      if (vm.title.length <= 3) {
        return true;
      } else if (vm.holderType === 'specific' && vm.specificHolders.length === 0) {
        return true;
      }
      return false;
    }

    function search(query) {
      var settings = {
        query: query,
        limit: calculateSearchLimit()
      };

      NstSvcUserFactory.search(settings, NST_USER_SEARCH_AREA.ACCOUNTS)
        .then(function (users) {
          users = _.unionBy(users, 'id');
          vm.users = _.differenceBy(users, vm.specificHolders, 'id');
          if (_.isString(query)
            && _.size(query) >= 4
            && _.indexOf(query, " ") === -1
            && !_.some(vm.users, { id : query })) {

            var initProfile = NstSvcUserFactory.parseTinyUser({
              _id: settings.query,
              fname: settings.query,
            });
            vm.users.push(initProfile);
          }
          vm.query = query;
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    function calculateSearchLimit() {
      return defaultSearchResultCount + vm.specificHolders.length;
    }

    function createLabel() {
      var isPublic = (vm.holderType === 'all');
      //TODO: add specific holders
      NstSvcLabelFactory.create(vm.title, vm.code, isPublic).then(function (result) {
        if (isPublic) {
          toastr.success(NstSvcTranslation.get("Label created successfully."));
        } else {
          var specificHolders = _.map(vm.specificHolders, function (item) {
            return item.id;
          });
          NstSvcLabelFactory.addMember(result.id, specificHolders.join(',')).then(function (result) {
            toastr.success(NstSvcTranslation.get("Label created successfully."));
          }).catch(function (error) {
            toastr.warning(NstSvcTranslation.get("Label created successfully, but no member assigned to it!"));
          });
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      }).finally(function () {
        $uibModalInstance.close(true);
        // $scope.$dismiss();
      });
    }
  }

})();
