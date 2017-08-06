(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('requestLabelController', requestLabelController);

  function requestLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace) {

    var vm = this;
    vm.color = 'D';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holders = 'all';
  }

})();
