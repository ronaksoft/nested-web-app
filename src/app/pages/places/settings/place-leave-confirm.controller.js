(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceLeaveConfirmController', PlaceLeaveConfirmController);

  /** @ngInject */
  function PlaceLeaveConfirmController(selectedPlace) {
    var vm = this;

    vm.placeTitle = selectedPlace;
  }
})();
