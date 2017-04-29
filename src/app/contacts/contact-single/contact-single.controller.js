(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('ContactSingleController', ContactSingleController);

  /** @ngInject */
  function ContactSingleController(toastr, NstSvcTranslation, NstSvcContactFactory) {
    var vm = this;

    vm.toggleFavorite = toggleFavorite;
    vm.add = _.partial(add, vm.contactId);
    vm.remove = _.partial(remove, vm.contactId);

    (function () {
      loadContact(vm.contactId);
    })();

    function loadContact(id) {
      vm.loadProgress = true;
      NstSvcContactFactory.get(id).then(function (contact) {
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
        vm.contact.isAdded = true;
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
        vm.contact.isFavorite = true;
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
  }
})();
