(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceRemoveConfirmController', PlaceRemoveConfirmController);

  /** @ngInject */
  function PlaceRemoveConfirmController(selectedPlace) {
    var vm = this;
    vm.place = selectedPlace;

    vm.validateInput = function () {
      return vm.placeIdInput === vm.place.id;
    };
  }
})();
