(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('createLabelController', createLabelController);

  function createLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace) {

    var vm = this;
    vm.color = 'D';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holdersAll = false;
  }

})();
