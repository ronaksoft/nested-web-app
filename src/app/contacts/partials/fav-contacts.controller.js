(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('FavoriteContactsController', FavoriteContacts);

  /** @ngInject */
  function FavoriteContacts(_, $state,
    NstSvcContactFactory) {
    var vm = this,
        MAX_ITEMS_COUNT = 10;

    vm.openContact = openContact;
    vm.errors = [];

    (function () {

      vm.loadProgress = true;
      NstSvcContactFactory.getFavorites().then(function (contacts) {
        vm.contacts = _.chain(contacts).orderBy(['name'], ['asc']).take(MAX_ITEMS_COUNT).value();
      }).catch(function (error) {
        vm.errorLoad = true;
      }).finally(function () {
        vm.loadProgress = false;
      });

    })();

    function openContact($event, contact) {
      $state.go('app.contacts', { contactId : 'sorousht', contact : contact } , { notify : false });
      $event.preventDefault();
    }

  }
})();
