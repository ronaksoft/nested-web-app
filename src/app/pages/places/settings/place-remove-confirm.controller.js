(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceRemoveConfirmController', PlaceRemoveConfirmController);

  /** @ngInject */
  function PlaceRemoveConfirmController(selectedPlace, $uibModalInstance, NST_CONFIG) {
    var vm = this;
    vm.place = selectedPlace;
    vm.domain = NST_CONFIG.DOMAIN;

    vm.validateInput = function () {
      return vm.placeIdInput === vm.place.id;
    };

    vm.remove = function () {
      if (vm.validateInput()) {
        $uibModalInstance.close();
      }
    };
  }
})();
