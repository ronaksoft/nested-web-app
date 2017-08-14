/**
 * @file src/app/contacts/partials/fav-contacts.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Populates a list of favorite contacts
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('FavoriteContactsController', FavoriteContacts);

  /** @ngInject */
  /**
   * Populates a list of favorite contacts
   *
   * @param {any} _
   * @param {any} $state
   * @param {any} $rootScope
   * @param {any} $scope
   * @param {any} NstSvcContactFactory
   * @param {any} NstUtility
   */
  function FavoriteContacts(_, $state, $rootScope, $scope,
    NstSvcContactFactory, NstUtility) {
    var vm = this,
        MAX_ITEMS_COUNT = 30,
        eventReferences = [];

    vm.openContact = openContact;

    (function () {

      vm.loadProgress = true;
      // Gets all contacts and filter by `isFavorite`. Then orders by lastnam and limits the number of contacts to 30
      NstSvcContactFactory.getAll().then(function (contacts) {
        vm.contacts = _.chain(contacts).filter({ 'isFavorite': true }).orderBy(['lastName'], ['asc']).take(MAX_ITEMS_COUNT).value();
      }).catch(function () {
        vm.errorLoad = true;
      }).finally(function () {
        vm.loadProgress = false;
      });

      // Listens to add/remove in favorite list
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

    /**
     * Opens the contact single-view page
     *
     * @param {any} $event
     * @param {any} contact
     */
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
