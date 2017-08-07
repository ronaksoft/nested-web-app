(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('createLabelController', createLabelController);

  function createLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _, NstSvcLabelFactory, NstSvcTranslation, NstUtility) {

    var vm = this;
    vm.code = 'A';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holderType = 'all';
    vm.specificHolders = [];
    vm.title = '';

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

    function createLabel() {
      var isPublic = (vm.holderType === 'all');
      //TODO: add specific holders
      NstSvcLabelFactory.create(vm.title, vm.code, isPublic).then(function (result) {
        if (result.status === 'ok') {
          if (isPublic) {
            toastr.success(NstSvcTranslation.get("Label created successfully."));
          } else {
            NstSvcLabelFactory.addMember(result.data.label_id, vm.specificHolders.join(',')).then(function (result) {
              toastr.success(NstSvcTranslation.get("Label created successfully."));
            }).catch(function (error) {
              toastr.warning(NstSvcTranslation.get("Label created successfully, but no member assigned to it!"));
            });
          }
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      }).finally(function () {
        $scope.$dismiss();
      });
    }
  }

})();
