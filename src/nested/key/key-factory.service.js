(function () {
  'use strict';
  angular
    .module('ronak.nested.web')
    .service('NstSvcKeyFactory', NstSvcKeyFactory);

  /** @ngInject */
  function NstSvcKeyFactory($q, _, NstSvcServer, NstBaseFactory, NstSvcGlobalCache) {

    function KeyFactory() {
      this.cache = NstSvcGlobalCache.createProvider('keys-data');
    }

    KeyFactory.prototype = new NstBaseFactory();
    KeyFactory.prototype.constructor = KeyFactory;
    KeyFactory.prototype.get = get;
    KeyFactory.prototype.set = set;
    KeyFactory.prototype.setCache = setCache;
    KeyFactory.prototype.parseCache = parseCache;
    KeyFactory.prototype.remove = remove;


    var factory = new KeyFactory();
    return factory;

    function get(key, cache) {
      if (cache === true) {
        var cachedData = this.parseCache(key);
        if (cachedData) {
          return $q.resolve(cachedData);
        }
      }

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        NstSvcServer.request('client/read_key', {
          key_name: key
        }).then(function (data) {
          factory.setCache({
            key: key,
            data: data.key_value
          });
          deferred.resolve(data.key_value);
        }).catch(deferred.reject);

        return deferred.promise;
      }, 'read' + key);
    }

    function setCache(data) {
      if (data && data.key) {
        this.cache.set(data.key, {
          value: data.data
        });
      }
    }

    function parseCache(key) {
      var cachedData = this.cache.get(key);
      if (cachedData) {
        return cachedData.value;
      } else {
        return false;
      }
    }

    function set(key, value) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('client/save_key', {
          key_name: key,
          key_value: value
        }).then(function (data) {
          factory.setCache({
            key: key,
            data: value
          });
          deferred.resolve(data);
        }).catch(deferred.reject);

        return deferred.promise;
      }, 'save' + key);
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
      }, 'remove' + key);
    }

  }
})
();
