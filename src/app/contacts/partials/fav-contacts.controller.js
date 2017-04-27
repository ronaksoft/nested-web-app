(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('favContactsController', favContacts);

  /** @ngInject */
  function favContacts($scope, $q, $stateParams, $state, toastr, _, $rootScope) {
    var vm = this;

    vm.openContact = openContact;

    function openContact($event,id) {
      $state.go('app.contact', { userId : id } , { notify : false });
      $event.preventDefault();
    };

  }
})();
