(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('removeLabelPromptController', removeLabelPromptController);

  /** @ngInject */
  function removeLabelPromptController(selectedLabel, $uibModalInstance, NST_CONFIG) {
    var vm = this;
    vm.label = selectedLabel;

    vm.remove = function () {
      $uibModalInstance.close();
    };
  }
})();
