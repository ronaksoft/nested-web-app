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
    vm.requestList = [];
    vm.pendingRequestList = [];
    vm.editLabel = editLabel;
    vm.createLabel = createLabel;
    vm.requestLabel = requestLabel;
    vm.declineRequest = declineRequest;
    vm.acceptRequest = acceptRequest;
    vm.withdrawRequest = withdrawRequest;
    vm.searchKeyUp = _.debounce(searchLabel, 512);
    init();

    function init() {
      searchLabel();
      if (vm.labelManager) {
        getRequest();
      } else {
        getPendingRequest();
      }
      NstSvcLabelFactory.getRequest().then(function (result) {
        console.log(result);
      });
    }

    function searchLabel() {
      var searchService;
      var filter = (vm.labelManager ? NST_LABEL_SEARCH_FILTER.ALL : NST_LABEL_SEARCH_FILTER.MY_PRIVATES);
      if (vm.keyword.length > 0) {
        searchService = NstSvcLabelFactory.search(vm.keyword, filter);
      } else {
        searchService = NstSvcLabelFactory.search(null, filter);
      }
      searchService.then(function (result) {
        vm.labels = result;
      });
    }

    function getRequest() {
      NstSvcUserFactory.getTiny('hamidrezakk').then(function (user) {
        vm.requestList.push({
          id: '1',
          user: user,
          label: {
            id: '1',
            code: 'A',
            title: 'Top Secret'
          }
        });
        vm.requestList.push({
          id: '2',
          user: user,
          label: {
            id: '2',
            code: 'B',
            title: 'Label 2'
          }
        });
      });
    }

    function getPendingRequest() {
      NstSvcUserFactory.getTiny('hamidrezakk').then(function (user) {
        vm.pendingRequestList.push({
          id: '1',
          user: user,
          label: {
            id: '1',
            code: 'A',
            title: 'Top Secret'
          }
        });
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
          searchLabel();
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
      });
    }

    function declineRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'reject').then(function (result) {
        removeRequest(id);
        toastr.success(NstSvcTranslation.get("Request declined successfully."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function acceptRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'accept').then(function (result) {
        removeRequest(id);
        toastr.success(NstSvcTranslation.get("Request accepted successfully."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function withdrawRequest(id) {
      NstSvcLabelFactory.cancelRequest(id).then(function (result) {
        removeRequest(id, true);
        toastr.success(NstSvcTranslation.get("Your request has been withdrawn successfully."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function removeRequest(id, pending) {
      var index;
      if (pending) {
        index = _.findIndex(vm.pendingRequestList, {id: id});
        vm.pendingRequestList.splice(index, 1);
      } else {
        index = _.findIndex(vm.requestList, {id: id});
        vm.requestList.splice(index, 1);
      }
    }
  }

})();
