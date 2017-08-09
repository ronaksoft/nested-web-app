(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('removeSelectedLabelPromptController', removeSelectedLabelPromptController);

  /** @ngInject */
  function removeSelectedLabelPromptController($uibModalInstance, argv) {
    var vm = this;

    vm.selectedItems = argv.selectedItems;
    vm.remove = function () {
      $uibModalInstance.close();
    };
  }
})();
