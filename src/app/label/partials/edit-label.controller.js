(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('editLabelController', editLabelController);

  function editLabelController($timeout, $scope, $q, $uibModalInstance, $uibModal,
    moment, toastr, _, NstSvcLabelFactory, NstSvcTranslation, NstUtility, argv) {

    var vm = this;
    vm.id = null;
    vm.code = 'A';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holderType = 'all';
    vm.specificHolders = [];
    vm.title = '';

    var specificHoldersBackup = [];

    vm.isNotValid = isNotValid;
    vm.addHolder = addHolder;
    vm.removeAllHolders = removeAllHolders;
    vm.setHolderType = setHolderType;
    vm.editLabel = editLabel;
    vm.removeLabel = removeLabel;

    if (argv.label) {
      init(argv.label);
    }

    function init(label) {
      vm.id = label.id;
      if (label.public) {
        vm.holderType = 'all';
      } else {
        vm.holderType = 'specific';
        vm.specificHolders = label.topMembers;
        NstSvcLabelFactory.getMembers(vm.id, 0, 100).then(function (result) {
          vm.specificHolders = result;
        });
      }
      vm.code = label.code;
      vm.title = label.title;
      specificHoldersBackup = _.clone(vm.specificHolders);
    }

    function isNotValid() {
      if (vm.title.length <= 1) {
        return true;
      } else if (vm.holderType === 'specific' && vm.specificHolders.length === 0) {
        return true;
      }
      return false;
    }

    function removeAllHolders() {
      vm.specificHolders = [];
    }

    function setHolderType(type) {
      vm.holderType = type;
    }

    function callHolderPromises() {
      var holderActionPromises = [];
      var toAddHolders;
      var toRemoveHolders;
      function equalLabel(a, b) {
        return a.id === b.id;
      }

      toAddHolders = _.differenceWith(vm.specificHolders, specificHoldersBackup, equalLabel);
      toAddHolders = _.map(toAddHolders, function (item) {
        return item.id;
      });
      if (toAddHolders.length > 0) {
        holderActionPromises.push(NstSvcLabelFactory.addMember(vm.id, toAddHolders.join(',')));
      }

      toRemoveHolders = _.differenceWith(specificHoldersBackup, vm.specificHolders, equalLabel);
      toRemoveHolders = _.map(toRemoveHolders, function (item) {
        return item.id;
      });
      for (var i = 0; i < toRemoveHolders.length; i++) {
        holderActionPromises.push(NstSvcLabelFactory.removeMember(vm.id, toRemoveHolders[i]));
      }

      return $q.all(holderActionPromises);
    }

    function editLabel() {
      NstSvcLabelFactory.update(vm.id, vm.title, vm.code).then(function (result) {
        callHolderPromises().then(function (result) {
          toastr.success(NstSvcTranslation.get("Label modified successfully."));
        });
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

    function addHolder() {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/label/partials/add-user-label.html',
        controller: 'addUserLabelController',
        controllerAs: 'addHolderCtrl',
        size: 'sm',
        resolve: {
          argv: {
            selectedUser: vm.specificHolders
          }
        }
      }).result.then(function (result) {
        if (result) {
          vm.specificHolders = result;
        }
      });
    }

    function removeLabel() {
      NstSvcLabelFactory.remove(vm.id).then(function (result) {
        toastr.success(NstSvcTranslation.get("Label removed successfully."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      }).finally(function () {
        $uibModalInstance.close(true);
      });
    }
  }

})();
