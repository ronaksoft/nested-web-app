(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('ContactListController', ContactListController);

  /** @ngInject */
  function ContactListController(toastr, $q,
    NstSvcContactFactory, NstSvcTranslation) {
    var vm = this;

    vm.search = _.debounce(search, 768);

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
            var fullName = _.toLower(contact.fullName),
                id = _.toLower(contact.id),
                word = _.toLower(keyword);

            return _.includes(fullName, word) || _.includes(id, word);
          });

        vm.favorites = orderItems(_.filter(filteredItems, 'isFavorite'));
        vm.contacts = _.chain(filteredItems)
          .groupBy(function (contact) {
            var orderFactor = getContactOrderFactor(contact);

            if (orderFactor && orderFactor.length > 0) {
              var value = _.chain(orderFactor).head().toLower().value();

              if (!_.isNaN(_.toNumber(value))) { // is a number

                return "#";
              }

              return value;
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
        return getContactOrderFactor(item);
      }], ['asc'])
    }

    function getContactOrderFactor(contact) {
      return contact.lastName || contact.firstName;
    }
  }
})();
