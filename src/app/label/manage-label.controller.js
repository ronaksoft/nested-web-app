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
    vm.labelManager = true;
    vm.labels = [];
    vm.requestList = [];
    vm.editLabel = editLabel;
    vm.declineRequest = declineRequest;
    vm.acceptRequest = acceptRequest;
    init();

    function init() {
      NstSvcLabelFactory.search().then(function (result) {
        vm.labels = result;
      });

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
      var accountId = _.find(vm.requestList, {id: id});
      removeRequest(accountId);
      toastr.success(NstSvcTranslation.get("Request declined successfully."));
      // NstSvcLabelFactory.addMember(id, accountId).then(function (data) {
      //
      // });
    }

    function acceptRequest(id) {
      var accountId = _.find(vm.requestList, {id: id});
      removeRequest(accountId);
      toastr.success(NstSvcTranslation.get("Request accepted successfully."));
      // NstSvcLabelFactory.addMember(id, accountId).then(function (data) {
      //
      // });
    }

    function removeRequest(id) {
      var index = _.findIndex(vm.requestList, {id: id});
      vm.requestList.splice(index, 1);
    }

  }

})();
