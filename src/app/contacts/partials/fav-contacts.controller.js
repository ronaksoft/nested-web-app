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
    vm.contacts = [];

    (function () {

      vm.loadProgress = true;
      // Gets all contacts and filter by `isFavorite`. Then orders by lastnam and limits the number of contacts to 30
      NstSvcContactFactory.getAll(function (cachedContacts){
        vm.contacts = filterFavorites(cachedContacts);
      }).then(function (contacts) {
        var favorites = filterFavorites(contacts);
        var newItems = _.differenceBy(favorites, vm.contacts, 'id');
        var removedItems = _.differenceBy(vm.contacts, favorites, 'id');

        // first omit the removed items; The items that are no longer exist in fresh contacts
        _.forEach(removedItems, function (item) {
          var index = _.findIndex(vm.contacts, { 'id': item.id });
          if (index > -1) {
            vm.contacts.splice(index, 1);
          }
        });

        // add new items; The items that do not exist in cached items, but was found in fresh contacts
        vm.contacts.unshift.apply(vm.contacts, newItems);
        
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
      _.forEach(eventReferences, function(canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

    function filterFavorites(contacts) {
      return _.chain(contacts).filter({ 'isFavorite': true }).orderBy(['lastName'], ['asc']).take(MAX_ITEMS_COUNT).value();
    }

  }
})();
