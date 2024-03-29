/**
 * @file src/app/contacts/partials/fav-contacts.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Creates a list of contacts that are grouped and sorted. The user can search contacts by name and Id
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .controller('ContactListController', ContactListController);

  /** @ngInject */
  /**
   * The user's contacts list
   *
   * @param {any} toastr
   * @param {any} $q
   * @param {any} $scope
   * @param {any} NstSvcContactFactory
   * @param {any} NstSvcTranslation
   */
  function ContactListController(toastr, $q, _, $scope, $rootScope,
    NstSvcContactFactory, NstSvcTranslation, NST_USER_SEARCH_AREA, NstSvcUserFactory) {
    var vm = this;
    vm.stranges = [];

    vm.search = _.debounce(search, 512);
    vm.searchStranges = _.debounce(searchStranges, 512);
    vm.view = view;
    vm.addContact = addContact;

    (function () {
      search(null);
    })();

    /**
     * Returns a Promise that resolves a list of all contacts
     *
     * @returns
     */
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

    /**
     * Filters contacts by the given keyword and groups by the starting character of name.
     * This function also clears favorites list in search mode
     *
     * @param {any} keyword
     */
    function search(keyword) {
      get().then(function (contacts) {
        scrollTop();
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

            // This is for contacts without name!
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

          if (keyword) {
            vm.searchStranges(keyword, contacts);
          }
      });
    }

    function searchStranges(query, contacts) {
      const settings = {
        query: query,
        limit: 100
      };
      NstSvcUserFactory.search(settings, NST_USER_SEARCH_AREA.ACCOUNTS, true)
      .then(function (users) {
        users = _.unionBy(users, 'id');
        vm.stranges = _.differenceBy(users, contacts, 'id');
      })
    }
    /**
     * Orders a list of contact by lastname and firstname
     *
     * @param {any} items
     * @returns
     */
    function orderItems(items) {
      return _.orderBy(items, [function (item) {
        return getOrderFactor(item);
      }], ['asc'])
    }

    function getOrderFactor(contact) {
      return contact.lastName || contact.firstName;
    }

    /**
     * Returns true if the keyword does match either name or Id
     *
     * @param {any} contact
     * @param {any} keyword
     * @returns
     */
    function contactHasKeyword(contact, keyword) {
      var fullName = _.toLower(contact.fullName),
          id = _.toLower(contact.id),
          word = _.toLower(keyword);

      return _.includes(fullName, word) || _.includes(id, word);
    }

    /**
     * Returns the first character of the given word
     *
     * @param {any} word
     * @returns
     */
    function getFirstChar(word) {
      return _.chain(word).head().toLower().value();
    }

    /**
     * Returns true if the provided string is convertible to Number
     *
     * @param {any} character
     * @returns
     */
    function isNumber(character) {
      return !_.isNaN(_.toNumber(character));
    }


    function scrollTop() {
      if (_.isFunction($scope.scrollToTop)) {
        $scope.scrollToTop();
      }
    }

    function view(contact) {
      $scope.$emit('view-contact', contact);
    }

    function addContact(contact, ev) {
      ev.preventDefault();
      ev.stopPropagation();
      NstSvcContactFactory.add(contact.id).then(function () {
        moveStrangeToContacts(contact);
        $rootScope.$broadcast('contact-favorite-add', contact);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("An error has occured while adding the user in your favorite contact list."));
      });
    }

    function moveStrangeToContacts(contact) {
      var orderFactor = getOrderFactor(contact);
      var firstChar = getFirstChar(orderFactor);
      if (isNumber(firstChar)) {
        firstChar = "#";
      }
      var grp = _.find(vm.contacts, function(gp) {
        return gp.key === firstChar;
      });
      if (grp) {
        grp.items.push(contact)
      } else {
        vm.contacts.push({
          key: firstChar,
          items: [contact],
        });
      }
      _.remove(vm.stranges, function(user) {
        return user.id === contact.id;
      });
    }
  }
})();
