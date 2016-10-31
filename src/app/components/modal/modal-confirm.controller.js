(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.modal')
    .controller('ModalConfirmController', ModalConfirmController);

  /** @ngInject */
  function ModalConfirmController($scope, title, message, buttons) {
    var vm = this;

    vm.title = title || "Confirm";
    vm.message = message || "Please make sure before doing this action.";
    vm.buttons = {
      yes : buttons.yes || "I'm sure",
      no : buttons.no || "Cancel"
    };
  }
})();
