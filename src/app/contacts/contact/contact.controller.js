(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('ContactController', ContactController);

  /** @ngInject */
  function ContactController($stateParams, toastr, $uibModal, $state, $timeout, $q, $scope) {
    var vm = this;
    console.log("$stateParams", $stateParams);
    (function () {
      if ($stateParams.contactId && $stateParams.contactId.length > 0) {
        vm.mode = 'single';
        vm.contact = $stateParams.contact;
      } else {
        vm.mode = 'list';
      }
    })();
  }
})();
