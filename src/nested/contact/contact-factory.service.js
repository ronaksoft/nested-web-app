(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcContactFactory', NstSvcContactFactory);

  /** @ngInject */
  function NstSvcContactFactory($q, _, NstSvcServer, NstBaseFactory) {

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
        var deferred = $q.defer();

        NstSvcServer.request('contact/get', {
          contact_id: id
        }).then(function (data) {
          deferred.resolve(parse(data));
        }).catch(deferred.reject);

        return deferred.promise;
      }, "get");
    }

    function add(contact) {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('contact/add', contact).then(function (data) {
          deferred.resolve(data);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "add");
    }

    function addFavorite(id) {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('contact/add_favorite', {
          contact_id : id
        }).then(function (data) {
          deferred.resolve(data);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "addFavorite");
    }

    function removeFavorite(id) {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('contact/remove_favorite', {
          contact_id : id
        }).then(function (data) {
          deferred.resolve(data);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "removeFavorite");
    }

    function remove(id) {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('contact/remove', {
          contact_id : id
        }).then(function (data) {
          deferred.resolve(data);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "remove");
    }

    function getAll() {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('contact/get_all', {}).then(function (data) {
          deferred.resolve(_.map(data.contacts, parse));
        }).catch(deferred.reject);

        return deferred.promise;
      }, "getAll");
    }

    function getFavorites() {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('contact/get_favorites', {}).then(function (data) {
          deferred.resolve(_.map(data.contacts, parse));
        }).catch(deferred.reject);

        return deferred.promise;
      }, "getAll");
    }

    function parse(data) {
      return data;
    }

  }
})
();
