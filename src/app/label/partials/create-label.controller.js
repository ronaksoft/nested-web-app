(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('createLabelController', createLabelController);

  function createLabelController($scope, $q, $uibModalInstance, $filter,
    toastr, _, NstSvcLabelFactory, NstSvcUserFactory, NST_USER_SEARCH_AREA, NstSvcTranslation) {

    var vm = this;
    vm.code = 'A';
    vm.holderType = 'all';
    var eventReferences = [];
    vm.specificHolders = [];
    vm.searchMore = searchMore;
    vm.title = '';
    vm.suggestPickerConfig = {
      limit : 100,
      suggestsLimit: 8,
      singleRow: false,
      mode: 'user',
      placeholder: NstSvcTranslation.get('Enter username or user-id')
    };
    var defaultSearchResultCount = 9;
    vm.users = [];
    vm.search = _.debounce(search, 512);
    vm.query = '';

    vm.isNotValid = isNotValid;
    vm.createLabel = createLabel;

    if ($scope.$resolve !== undefined && $scope.$resolve.modalData !== undefined) {
      vm.title = $scope.$resolve.modalData.title;
    }

    eventReferences.push($scope.$watch(function () {
      return vm.query
    }, function(keyword){return vm.search(keyword)}, true));

    function isNotValid() {
      if (vm.title.length <= 1) {
        return true;
      } else if (vm.holderType === 'specific' && vm.specificHolders.length === 0) {
        return true;
      }
      return false;
    }

    function searchMore() {
      vm.suggestPickerConfig.suggestsLimit++;
      return vm.search(vm.query);
    }

    function search(query) {
      var settings = {
        query: query || vm.query,
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
      return defaultSearchResultCount + vm.specificHolders.length;
    }

    function createLabel() {
      var isPublic = (vm.holderType === 'all');
      var title = $filter('scapeSpace')(vm.title);
      NstSvcLabelFactory.create(title, vm.code, isPublic).then(function (result) {
        if (isPublic) {
          toastr.success(NstSvcTranslation.get("Label created successfully."));
        } else {
          var specificHolders = _.map(vm.specificHolders, function (item) {
            return item.id;
          });
          NstSvcLabelFactory.addMember(result.id, specificHolders.join(',')).then(function () {
            toastr.success(NstSvcTranslation.get("Label created successfully."));
          }).catch(function () {
            toastr.warning(NstSvcTranslation.get("Label created successfully, but no member assigned to it!"));
          });
        }
        $uibModalInstance.close(true);
      }).catch(function (error) {
        if (error.code === 5) {
          toastr.warning(NstSvcTranslation.get("Label already exists!"));
        } else {
          toastr.error(NstSvcTranslation.get("Something went wrong."));
          $uibModalInstance.close(true);
        }
      });
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });

    });
  }

})();
