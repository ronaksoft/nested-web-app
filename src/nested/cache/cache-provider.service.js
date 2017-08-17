(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstSvcCacheProvider', NstSvcCacheProvider);

  /** @ngInject */
  function NstSvcCacheProvider(NstSvcCacheDb, _) {
    var EXPIRATION_KEY = '__exp';
    var EXPIRATION_TIME = 1000 * 60 * 5;
    function CacheProvider(namespace) {
      this.namespace = namespace;
      this.db = new NstSvcCacheDb(this.namespace);
      this.memory = {};
    }

    CacheProvider.prototype = {};
    CacheProvider.prototype.constructor = CacheProvider;

    CacheProvider.prototype.get = function(key) {
      if (!validateKey(key)) {
        return -1;
      }

      var model = this.memory[key] || this.db.get(key);
      var expiration = model[EXPIRATION_KEY];
      
      if (!expiration) {
        return model;
      }

      if (expiration > Date.now()) {
        this.remove(key);

        return null;
      }

      return model;
    }

    CacheProvider.prototype.remove = function(key) {
      if (!validateKey(key)) {
        return -1;
      }

      _.unset(this.memory, key);
      return this.db.set(key);
    }

    CacheProvider.prototype.set = function(key, value) {
      if (!validateKey(key)) {
        return -1;
      }

      var expirationExtension = {};
      expirationExtension[EXPIRATION_KEY] = Date.now() + EXPIRATION_TIME;
      var extendedValue = Object.assign(expirationExtension, value);

      this.memory[key] = extendedValue;
      return this.db.set(key, extendedValue);
    }

    function validateKey(key) {
      if (!key || !_.isString(key)) {
        console.error('The key must be a nonempty string.', key);
        return false;
      }

      return true;
    }

    return CacheProvider;
  }
})();
