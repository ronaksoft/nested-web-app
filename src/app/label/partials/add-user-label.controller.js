(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('addUserLabelController', addUserLabelController);

  function addUserLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _, NstSvcLabelFactory, NstSvcTranslation, NstUtility) {

    var vm = this;
    vm.code = 'A';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holderType = 'all';
    vm.specificHolders = [];
    vm.title = '';
  }

})();
