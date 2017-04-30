(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('ContactSingleController', ContactSingleController);

  /** @ngInject */
  function ContactSingleController($q, $state, toastr, $scope, $uibModalStack,
    NstSvcTranslation, NstSvcContactFactory, NstSvcPlaceFactory) {
    var vm = this;

    vm.toggleFavorite = toggleFavorite;
    vm.add = _.partial(add, vm.contactId);
    vm.remove = _.partial(remove, vm.contactId);
    vm.viewConversation = _.partial(viewConversation, vm.contactId);
    vm.sendMessage = _.partial(sendMessage, vm.contactId);
    vm.close = close;

    (function () {
      loadContact(vm.contactId);
    })();

    function loadContact(id) {
      vm.loadProgress = true;
      getContact(id).then(function (contact) {
        vm.contact = contact;
        return NstSvcPlaceFactory.getMutualPlaces(id);
      }).then(function (places) {
        vm.mutualPlaces = places;
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occured while loading the contact data."));
      }).finally(function () {
        vm.loadProgress = false;
      });
    }

    function add(id) {
      vm.addProgress = true;
      NstSvcContactFactory.add(id).then(function () {
        vm.contact.isAdded = true;
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occured while adding the user in your contacts list."));
      });
    }

    function remove(id) {
      vm.removeProgress = true;
      NstSvcContactFactory.remove(id).then(function () {
        vm.contact.isAdded = false;
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occured while removing the user from your contacts list."));
      }).finally(function () {
        vm.removeProgress = false;
      });
    }

    function favorite(id) {
      vm.favoriteProgress = true;
      NstSvcContactFactory.addFavorite(id).then(function () {
        vm.contact.isFavorite = true;
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occured while adding the user in your favorite contact list."));
      }).finally(function () {
        vm.favoriteProgress = false;
      });
    }

    function removeFavorite(id) {
      vm.removeFavoriteProgress = true;
      NstSvcContactFactory.addFavorite(id).then(function () {
        vm.contact.isFavorite = false;
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occured while adding the user in your favorite contact list."));
      }).finally(function () {
        vm.removeFavoriteProgress = true;
      });
    }

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

      // try to find the contact between all contacts
      var allContacts = NstSvcContactFactory.getAll();
      var contact = _.find(allContacts, { id : id });

      if (contact && contact.id) {
        return $q.resolve(contact);
      }

      // request a contact
      return NstSvcContactFactory.get(id);
    }

    function viewConversation(id) {
      close().then(function () {
        $state.go('app.conversation', { userId: id });
      });
    }

    function sendMessage(id) {
      close().then(function () {
        $state.go('app.place-compose', { placeId: id }, {notify: false});
      });
    }

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

  }
})();
