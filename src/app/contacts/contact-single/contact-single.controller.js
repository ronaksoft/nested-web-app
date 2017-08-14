/**
 * @file src/app/contacts/contact-single.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A user contact view
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('ContactSingleController', ContactSingleController);

  /** @ngInject */
  /**
   * Displays a contact information and her mutual places with the user
   *
   * @param {any} $q
   * @param {any} $state
   * @param {any} toastr
   * @param {any} $scope
   * @param {any} $uibModalStack
   * @param {any} $rootScope
   * @param {any} $stateParams
   * @param {any} NstSvcTranslation
   * @param {any} NstSvcContactFactory
   * @param {any} NstSvcPlaceFactory
   */
  function ContactSingleController($q, $state, toastr, _, $scope, $uibModalStack, $rootScope, $stateParams,
    NstSvcTranslation, NstSvcContactFactory, NstSvcPlaceFactory) {
    var vm = this;

    vm.toggleFavorite = toggleFavorite;
    vm.add = _.partial(add, vm.contactId);
    vm.remove = _.partial(remove, vm.contactId);
    vm.viewConversation = _.partial(viewConversation, vm.contactId);
    vm.sendMessage = _.partial(sendMessage, vm.contactId);
    vm.close = back;
    vm.goToPlace = goToPlace;

    (function () {
      loadContact(vm.contactId);
    })();

    /**
     * Loads the contact information and retrieves the mutual places
     *
     * @param {any} id
     */
    function loadContact(id) {
      vm.loadProgress = true;
      getContact(id).then(function (contact) {
        vm.contact = contact;
        return NstSvcPlaceFactory.getMutualPlaces(id);
      }).then(function (places) {
        vm.mutualPlaces = places;
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("An error has occured while loading the contact data."));
      }).finally(function () {
        vm.loadProgress = false;
      });
    }

    /**
     * Adds the user with the given Id to the authenticated user contacts
     *
     * @param {any} id
     */
    function add(id) {
      vm.addProgress = true;
      NstSvcContactFactory.add(id).then(function () {
        vm.contact.isContact = true;
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("An error has occured while adding the user in your contacts list."));
      });
    }

    /**
     * Removes the user from the authenticated user's contact list and broadcasts `contact-favorite-remove`
     * to tell contact side-widget the contact is no longer in favorites list
     *
     * @param {any} id
     * @returns
     */
    function remove(id) {
      if (!vm.contact.isContact) {
        return;
      }

      vm.removeProgress = true;
      NstSvcContactFactory.remove(id).then(function () {
        vm.contact.isContact = false;
        vm.contact.isFavorite = false;
        $rootScope.$broadcast('contact-favorite-remove', vm.contact);
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occured while removing the user from your contacts list."));
      }).finally(function () {
        vm.removeProgress = false;
      });
    }

    /**
     * Favorites a contact and broadcasts 'contact-favorite-add'.
     *
     * @param {any} id
     */
    function addFavorite(id) {
      vm.favoriteProgress = true;
      NstSvcContactFactory.addFavorite(id).then(function () {
        vm.contact.isFavorite = true;
        $rootScope.$broadcast('contact-favorite-add', vm.contact);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("An error has occured while adding the user in your favorite contact list."));
      }).finally(function () {
        vm.favoriteProgress = false;
      });
    }

    /**
     * Removes the given user from favorite contacts and broadcasts `contact-favorite-remove`
     *
     * @param {any} id
     */
    function removeFavorite(id) {
      vm.removeFavoriteProgress = true;
      NstSvcContactFactory.removeFavorite(id).then(function () {
        vm.contact.isFavorite = false;
        $rootScope.$broadcast('contact-favorite-remove', vm.contact);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("An error has occured while adding the user in your favorite contact list."));
      }).finally(function () {
        vm.removeFavoriteProgress = true;
      });
    }

    /**
     * Favorites/Unfavorites a contact by using `addFavorite` and `removeFavorite`
     * @see addFavorite
     * @see removeFavorite
     * @returns
     */
    function toggleFavorite() {
      if (vm.contact.isFavorite) {
        return removeFavorite(vm.contact.id);
      } else {
        return addFavorite(vm.contact.id);
      }
    }

    function getContact(id) {
      // find if the contact exists in vm
      if (vm.contact && vm.contact.id === id) {
        return $q.resolve(vm.contact);
      }

      // request a contact
      return NstSvcContactFactory.get(id);
    }

    /**
     * Closes the modal and navigates to conversation page
     *
     * @param {any} id
     */
    function viewConversation(id) {
      close().then(function () {
        $state.go('app.conversation', { userId: id });
      });
    }

    /**
     * Closes the modal and navigates to compose page
     *
     * @param {any} id
     */
    function sendMessage(id) {
      close().then(function () {
        $state.go('app.place-compose', { placeId: id }, {notify: false});
      });
    }

    /**
     * Closes the modal and returns a Promise that will be resolved when the modal disappeared
     *
     * @returns
     */
    function close() {
      var deferred = $q.defer();

      var currentModal = $uibModalStack.getTop();
      if (!currentModal) {
        deferred.reject();
      } else {
        currentModal.key.result.catch(function () {
          deferred.resolve();
        });
      }

      currentModal.key.dismiss();

      return deferred.promise;
    }

    /**
     * Closes the modal or switches to list-view
     *
     */
    function back() {
      if ($stateParams.contactId) {
        close();
      } else {
        $scope.$emit('view-contact-list');
      }
    }

    /**
     * Closes the modal and Navigates to the place messages page
     *
     * @param {any} $event
     * @param {any} place
     */
    function goToPlace($event, place) {
      $event.preventDefault();
      close().then(function () {
        $state.go('app.place-messages', { placeId: place.id });
      });
    }
  }
})();
