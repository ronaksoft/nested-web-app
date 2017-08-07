(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('manageLabelController', manageLabelController);

  function manageLabelController($timeout, $scope, $q, $uibModalInstance, $uibModal,
    moment, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace, NstSvcUserFactory, NstSvcLabelFactory) {

    var vm = this;
    vm.keyword = '';
    vm.labelManager = true;
    vm.labels = [];
    vm.requestList = [];
    vm.pendingRequestList = [];
    vm.editLabel = editLabel;
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
    }

    function searchLabel() {
      var searchService;
      if (vm.keyword.length > 0) {
        searchService = NstSvcLabelFactory.search(vm.keyword);
      } else {
        searchService = NstSvcLabelFactory.search();
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
      });
    }

    function declineRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'accept').then(function (result) {
        if (result.status === 'ok') {
          removeRequest(id);
          toastr.success(NstSvcTranslation.get("Request declined successfully."));
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function acceptRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'accept').then(function (result) {
        if (result.status === 'ok') {
          removeRequest(id);
          toastr.success(NstSvcTranslation.get("Request accepted successfully."));
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function withdrawRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'withdraw').then(function (result) {
        if (result.status === 'ok') {
          removeRequest(id, true);
          toastr.success(NstSvcTranslation.get("Your request has been withdrawn successfully."));
        }
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
