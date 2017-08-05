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

    /**
     * @function goLabelRoute
     * Opens the label manager modal
     * @param {any} $event
     */
    vm.createLabel = function ($event) {
      $event.preventDefault();
      $uibModal.open({
        animation: false,
        size: 'lg-white',
        templateUrl: 'app/label/modal/create-label.html',
        controller: 'manageLabelController',
        controllerAs: 'ctrl'
      })
    };
    
  }

})();
