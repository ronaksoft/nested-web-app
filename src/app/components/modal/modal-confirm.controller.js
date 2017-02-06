(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.modal')
    .controller('ModalConfirmController', ModalConfirmController);

  /** @ngInject */
  function ModalConfirmController($scope, title, message, buttons) {
    var vm = this;

    vm.title = title || NstSvcTranslation.get("Confirm");
    vm.message = message || NstSvcTranslation.get("Please make sure before doing this action.");
    vm.buttons = {
      yes : buttons.yes || NstSvcTranslation.get("I'm sure"),
      no : buttons.no || NstSvcTranslation.get("Cancel")
    };
  }
})();
