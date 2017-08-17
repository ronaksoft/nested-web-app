(function () {
  'use strict';
  angular
    .module('ronak.nested.web')
    .service('NstSvcKeyFactory', NstSvcKeyFactory);

  /** @ngInject */
  function NstSvcKeyFactory($q, _, NstSvcServer, NstBaseFactory) {

    function KeyFactory() {
    }

    KeyFactory.prototype = new NstBaseFactory();
    KeyFactory.prototype.constructor = KeyFactory;
    KeyFactory.prototype.get = get;
    KeyFactory.prototype.set = set;
    KeyFactory.prototype.remove = remove;


    var factory = new KeyFactory();
    return factory;

    function get(key) {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('client/read_key', {
          key_name: key
        }).then(function (data) {
          deferred.resolve(data.key_value);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "read" + key);
    }

    function set(key, value) {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('client/save_key', {
          key_name: key,
          key_value: value
        }).then(function (data) {
          deferred.resolve(data);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "save" + key);
    }

    function remove(key) {

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('client/remove_key', {
          key_name: key
        }).then(function (data) {
          deferred.resolve(data);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "remove" + key);
    }

  }
})
();
