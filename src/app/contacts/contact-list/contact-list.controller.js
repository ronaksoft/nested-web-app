(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('ContactListController', ContactListController);

  /** @ngInject */
  function ContactListController(toastr, $q, $scope,
    NstSvcContactFactory, NstSvcTranslation) {
    var vm = this;

    vm.search = _.debounce(search, 512);
    vm.view = view;

    (function () {
      search(null);
    })();

    function get() {
      var deferred = $q.defer();

      vm.loadProgress = true;
      NstSvcContactFactory.getAll().then(function (contacts) {
        deferred.resolve(contacts);
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error occured while loading your contacts list."));
        deferred.reject(error);
      }).finally(function () {
        vm.loadProgress = false;
      });

      return deferred.promise;
    }

    function search(keyword) {
      get().then(function (contacts) {
        var filteredItems = _.filter(contacts, function (contact) {
            return contactHasKeyword(contact, keyword);
          });
        
        if (keyword && keyword.length > 0) {
          vm.favorites = [];
        } else {
          vm.favorites = orderItems(_.filter(filteredItems, { 'isFavorite' : true }));
        }

        vm.contacts = _.chain(filteredItems)
          .groupBy(function (contact) {
            var orderFactor = getOrderFactor(contact);
            var firstChar = getFirstChar(orderFactor);

            if (firstChar && firstChar.length === 1) {

              if (isNumber(firstChar)) {

                return "#";
              }

              return firstChar;
            }

            return "?";
          })
          .map(function (value, key) {
            return {
              key: key,
              items: orderItems(value)
            };
          })
          .orderBy([function (group) {
            return group.key;
          }], ['asc'])
          .value();
      });
    }

    function orderItems(items) {
      return _.orderBy(items, [function (item) {
        return getOrderFactor(item);
      }], ['asc'])
    }

    function getOrderFactor(contact) {
      return contact.lastName || contact.firstName;
    }

    function contactHasKeyword(contact, keyword) {
      var fullName = _.toLower(contact.fullName),
          id = _.toLower(contact.id),
          word = _.toLower(keyword);

      return _.includes(fullName, word) || _.includes(id, word);
    }

    function getFirstChar(word) {
      return _.chain(word).head().toLower().value();
    }

    function isNumber(character) {
      return !_.isNaN(_.toNumber(character));
    }

    function view(contact) {
      $scope.$emit('view-contact', contact);
    }
  }
})();
