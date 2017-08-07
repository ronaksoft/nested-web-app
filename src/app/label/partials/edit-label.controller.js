(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('editLabelController', editLabelController);

  function editLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _, NstSvcLabelFactory, NstSvcTranslation, NstUtility, argv) {

    var vm = this;
    vm.id = null;
    vm.code = 'A';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holderType = 'all';
    vm.specificHolders = [];
    vm.title = '';

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
      }
      vm.code = label.code;
      vm.title = label.title;
    }

    function isNotValid() {
      if (vm.title.length <= 3) {
        return true;
      } else if (vm.holderType === 'specific' && vm.specificHolders.length === 0) {
        return true;
      }
      return false;
    }

    function addHolder() {
      console.log('addHolder');
    }

    function removeAllHolders() {
      vm.specificHolders = []
      console.log('removeAllHolders');
    }

    function setHolderType(type) {
      vm.holderType = type;
      console.log('setHolderType: ' + type)
    }

    function editLabel() {
      NstSvcLabelFactory.update(vm.id, vm.title, vm.code).then(function (result) {
        if (result.status === 'ok') {
          toastr.success(NstSvcTranslation.get("Label modified successfully."));
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      }).finally(function () {
        $scope.$dismiss();
      });
    }

    function removeLabel() {
      console.log('removeLabel');
    }
  }

})();
