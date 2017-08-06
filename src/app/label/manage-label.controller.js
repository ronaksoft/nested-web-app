(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('manageLabelController', manageLabelController);

  function manageLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace) {

    var vm = this;
    vm.labelManager = false;
    // $uibModal.open({
    //     animation: false,
    //     size: 'lg-white multiple',
    //     templateUrl: 'app/label/partials/edit-label.html',
    //     controller: 'editLabelController',
    //     controllerAs: 'ctrl'
    // })
  }

})();
