(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceRemoveConfirmController', PlaceRemoveConfirmController);

  /** @ngInject */
  function PlaceRemoveConfirmController($scope, selectedPlace, selectedPlaces, $uibModalInstance, NST_CONFIG) {
    var vm = this;
    vm.place = selectedPlace;
    vm.places = selectedPlaces;
    vm.domain = NST_CONFIG.DOMAIN;
    $scope.nextStep = selectedPlaces && selectedPlaces.length > 0;

    vm.validateInput = function () {
      return vm.placeIdInput === vm.place.id;
    };

    if (vm.places) {
      vm.validateInput = function(){
        return true;
      }
    } 

    vm.remove = function () {
      if (vm.validateInput()) {
        $uibModalInstance.close();
      }
    };
  }
})();
