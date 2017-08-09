(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('LabelRemoveConfirmController', LabelRemoveConfirmController);

  /** @ngInject */
  function LabelRemoveConfirmController(selectedLabel, $uibModalInstance, NST_CONFIG) {
    var vm = this;
    vm.label = selectedLabel;

    vm.remove = function () {
      $uibModalInstance.close();
    };
  }
})();
