(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcContactFactory', NstSvcContactFactory);

  /** @ngInject */
  function NstSvcContactFactory($q, _,
    NstSvcServer, NstBaseFactory, NstSvcGlobalCache,
    NstContact, NstPicture) {

    function ContactFactory() {
      this.cache = NstSvcGlobalCache.createProvider('contact');
    }

    ContactFactory.prototype = new NstBaseFactory();
    ContactFactory.prototype.constructor = ContactFactory;

    ContactFactory.prototype.get = get;
    ContactFactory.prototype.add = add;
    ContactFactory.prototype.addFavorite = addFavorite;
    ContactFactory.prototype.removeFavorite = removeFavorite;
    ContactFactory.prototype.remove = remove;
    ContactFactory.prototype.getAll = getAll;

    var factory = new ContactFactory();
    return factory;

    function get(id) {
      var allContacts = getAllCachedSync();
      var cachedContact = _.find(allContacts, { '_id': id });
      if (cachedContact) {
        return $q.resolve(parse(cachedContact));
      }

      return NstSvcServer.request('contact/get', {
        contact_id: id
      }).then(function (result) {
        return $q.resolve(parse(result));
      });
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

    function getHash() {
      var cachedHashModel = factory.cache.get('_hash');

      if (cachedHashModel && cachedHashModel.hash) {
        return cachedHashModel.hash;
      }

      return '';
    }

    function setHash(value) {
      return factory.cache.set('_hash', {
        value: value,
      });
    }

    function getAllCachedSync() {
      var cachedModel = factory.cache.get('_all');
      if (cachedModel && cachedModel.value) {
        return cachedModel.value;
      }

      return [];
    }

    function setAll(value) {
      return factory.cache.set('_all', {
        value: value,
      });
    }

    function getAll(cacheHandler) {
      if (_.isFunction(cacheHandler)) {
        cacheHandler(_.map(getAllCachedSync(), parse));
      }

      var hash = getHash();

      return NstSvcServer.request('contact/get_all', {
        hash: hash || ""
      }).then(function (data) {
        if (data.hash && data.hash !== hash) {
          setHash(data.hash);
          setAll(data.contacts);
          return $q.resolve(_.map(data.contacts, parse));
        }

        return $q.resolve([]);
      });
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
