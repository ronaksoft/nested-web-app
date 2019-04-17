(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('RemoveFromConfirmController', RemoveFromConfirmController);

  function RemoveFromConfirmController(post, place) {
    var vm = this;
    vm.post = post;
    vm.place = place;
  }

})();
