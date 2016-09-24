(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ModalErrorController', ModalErrorController);

  /** @ngInject */
  function ModalErrorController($scope, title, reason) {
    var vm = this;
    vm.title = title;
    vm.reason = reason;
  }
})();
