(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceLeaveConfirmController', PlaceLeaveConfirmController);

  /** @ngInject */
  function PlaceLeaveConfirmController(selectedPlace) {
    var vm = this;
    
    vm.place = selectedPlace;
  }
})();
