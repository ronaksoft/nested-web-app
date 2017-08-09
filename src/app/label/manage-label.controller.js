(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('manageLabelController', manageLabelController);

  function manageLabelController($timeout, $scope, $q, $uibModalInstance, $uibModal
    , toastr, _, NstSvcTranslation, NstSvcUserFactory, NstSvcLabelFactory, NST_LABEL_SEARCH_FILTER, NstSvcAuth) {

    var vm = this;
    vm.keyword = '';
    vm.labelManager = NstSvcAuth.user.labelEditor;
    vm.labels = [];
    vm.haveMore = true;
    vm.requestList = [];
    vm.oldKeyword = ''
    vm.editLabel = editLabel;
    vm.createLabel = createLabel;
    vm.requestLabel = requestLabel;
    vm.declineRequest = declineRequest;
    vm.acceptRequest = acceptRequest;
    vm.withdrawRequest = withdrawRequest;
    vm.searchKeyUp = _.debounce(searchLabel, 512);
    vm.setting = {
      skip: 0,
      limit: 16,
    };

    init();

    function init() {
      searchLabel();
      getRequests();
    }

    function searchLabel() {
      if (!vm.haveMore) {
        return;
      }
      if (vm.oldKeyword !== vm.keyword) {
        restoreDefault();
      }
      var searchService;
      var filter = (vm.labelManager ? NST_LABEL_SEARCH_FILTER.ALL : NST_LABEL_SEARCH_FILTER.MY_PRIVATES);
      if (vm.keyword.length > 0) {
        searchService = NstSvcLabelFactory.search(vm.keyword, filter, vm.setting.skip, vm.setting.limit);
      } else {
        searchService = NstSvcLabelFactory.search(null, filter, vm.setting.skip, vm.setting.limit);
      }
      searchService.then(function (result) {
        vm.labels = vm.labels.concat(result);
        vm.oldKeyword = vm.keyword;
        vm.haveMore = result.length === vm.setting.limit;
        vm.setting.skip += result.length;
      });
    }

    function restoreDefault() {
      vm.setting.skip = 0;
      vm.labels = [];
      vm.haveMore = true;
    }

    function getRequests() {
      NstSvcLabelFactory.getRequests().then(function (result) {
        vm.requestList = result;
      });
    }

    function editLabel(id) {
      var label = null;
      if (id) {
        label = _.find(vm.labels, {id: id});
      }
      $uibModal.open({
        animation: false,
        size: 'lg-white multiple',
        templateUrl: 'app/label/partials/edit-label.html',
        controller: 'editLabelController',
        controllerAs: 'editCtrl',
        resolve: {
          argv: {
            label: label
          }
        }
      }).result.then(function (result) {
        if (result) {
          restoreDefault();
          searchLabel(vm.keyword);
        }
      });
    }

    function createLabel() {
      $uibModal.open({
        animation: false,
        size: 'lg-white multiple',
        templateUrl: 'app/label/partials/create-label.html',
        controller: 'createLabelController',
        controllerAs: 'createCtrl'
      }).result.then(function (result) {
        if (result) {
          restoreDefault();
          searchLabel();
        }
      });
    }

    function requestLabel() {
      $uibModal.open({
        animation: false,
        size: 'lg-white multiple',
        templateUrl: 'app/label/partials/request-label.html',
        controller: 'requestLabelController',
        controllerAs: 'requestCtrl'
      }).result.then(function (result) {
        if (result) {
          restoreDefault();
          getRequests();
        }
      });
    }

    function declineRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'reject').then(function (result) {
        removeRequest(id);
        searchLabel(vm.keyword);
        toastr.success(NstSvcTranslation.get("Request declined successfully."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function acceptRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'accept').then(function (result) {
        removeRequest(id);
        searchLabel(vm.keyword);
        toastr.success(NstSvcTranslation.get("Request accepted successfully."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function withdrawRequest(id) {
      NstSvcLabelFactory.cancelRequest(id).then(function (result) {
        removeRequest(id);
        toastr.success(NstSvcTranslation.get("Your request has been withdrawn successfully."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function removeRequest(id) {
      var index;
      index = _.findIndex(vm.requestList, {id: id});
      vm.requestList.splice(index, 1);
    }
  }

})();
