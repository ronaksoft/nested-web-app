(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcContactFactory', NstSvcContactFactory);

  /** @ngInject */
  function NstSvcContactFactory($q, _,
    NstSvcServer, NstBaseFactory, NstSvcContactStorage,
    NstContact, NstPicture) {

    function ContactFactory() {}

    ContactFactory.prototype = new NstBaseFactory();
    ContactFactory.prototype.constructor = ContactFactory;

    ContactFactory.prototype.get = get;
    ContactFactory.prototype.add = add;
    ContactFactory.prototype.addFavorite = addFavorite;
    ContactFactory.prototype.removeFavorite = removeFavorite;
    ContactFactory.prototype.remove = remove;
    ContactFactory.prototype.getAll = getAll;
    ContactFactory.prototype.getFavorites = getFavorites;


    var factory = new ContactFactory();
    return factory;

    function get(id) {
      return factory.sentinel.watch(function () {
        return NstSvcServer.request('contact/get', {
          contact_id: id
        }).then(function (result) {
          return $q.resolve(parse(result));
        });
      }, "get");
    }

    function add(id) {
      return factory.sentinel.watch(function () {
        return NstSvcServer.request('contact/add', {
          contact_id: id
        });
      }, "addContact" + id);
    }

    function addFavorite(id) {
      return factory.sentinel.watch(function () {
        return NstSvcServer.request('contact/add_favorite', {
          contact_id : id
        });
      }, "addFavorite");
    }

    function removeFavorite(id) {
      return factory.sentinel.watch(function () {
        return NstSvcServer.request('contact/remove_favorite', {
          contact_id : id
        });
      }, "removeFavorite");
    }

    function remove(id) {
      return factory.sentinel.watch(function () {
        return NstSvcServer.request('contact/remove', {
          contact_id : id
        });
      }, "remove");
    }

    function getAll() {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        var hash = NstSvcContactStorage.get("hash");

        NstSvcServer.request('contact/get_all', {
          hash: hash || ""
        }).then(function (data) {
          if (data.hash) {
            NstSvcContactStorage.set("hash", data.hash);
          }

          if (data.hash && data.hash !== hash) {
            NstSvcContactStorage.set("list", data.contacts || []);
          }

          var contacts = NstSvcContactStorage.get("list");
          deferred.resolve(_.map(contacts, parse));

        }).catch(deferred.reject);

        return deferred.promise;
      }, "getAll");
    }

    function getFavorites() {
      var deferred = $q.defer();
      return factory.sentinel.watch(function () {
        return NstSvcServer.request('contact/get_favorites', {}).then(function (data) {
          return $q.resolve(deferred.resolve(_.map(data.contacts, parse)));
        });
      }, "getAll");
    }

    function parse(data) {
      if (!_.isObject(data)) {
        throw Error("Could not create a contact model with an invalid data");
      }

      if (!data._id) {
        throw Error("Could not parse contact data without _id");
      }

      var contact = new NstContact();

      contact.id = data._id;
      contact.firstName = data.fname || '';
      contact.lastName = data.lname || '';
      contact.fullName = contact.getFullName();

      if (data.picture && data.picture.org) {
        contact.picture = new NstPicture(data.picture);
      }

      contact.isFavorite = data.is_favorite;
      contact.isContact = data.is_contact;
      contact.isMutual = data.is_mutual;

      return contact;
    }
  }
})
();
