(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('FavoriteContactsController', FavoriteContacts);

  /** @ngInject */
  function FavoriteContacts(_, $state, $rootScope, $scope,
    NstSvcContactFactory, NstUtility) {
    var vm = this,
        MAX_ITEMS_COUNT = 30,
        eventReferences = [];

    vm.openContact = openContact;

    (function () {

      vm.loadProgress = true;
      NstSvcContactFactory.getAll().then(function (contacts) {
        vm.contacts = _.chain(contacts).filter({ 'isFavorite': true }).orderBy(['lastName'], ['asc']).take(MAX_ITEMS_COUNT).value();
      }).catch(function (error) {
        vm.errorLoad = true;
      }).finally(function () {
        vm.loadProgress = false;
      });

      eventReferences.push($rootScope.$on('contact-favorite-add', function (event, contact) {
        if (_.some(vm.contacts, { id: contact.id })) {
          return;
        }

        vm.contacts.unshift(contact);
        if (vm.contacts.length >= MAX_ITEMS_COUNT) {
          vm.contacts.splice(-1,1);
        }
      }));

      eventReferences.push($rootScope.$on('contact-favorite-remove', function (event, contact) {
        NstUtility.collection.dropById(vm.contacts, contact.id);
      }));

    })();

    function openContact($event, contact) {
      $event.preventDefault();
      $state.go('app.contacts', { contactId : contact.id, contact : contact } , { notify : false });
    }

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
