(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstSvcCacheProvider', NstSvcCacheProvider);

  /** @ngInject */
  function NstSvcCacheProvider(NstSvcCacheDb, _) {
    var EXPIRATION_KEY = '__exp';
    var EXPIRATION_TIME = 1000 * 60 * 30;
    function CacheProvider(namespace) {
      this.namespace = namespace;
      this.memory = {};
    }

    CacheProvider.prototype = {};
    CacheProvider.prototype.constructor = CacheProvider;

    CacheProvider.prototype.get = function(key) {
      if (!validateKey(key)) {
        return -1;
      }

      var model = this.memory[key] || NstSvcCacheDb.get(this.namespace, key);

      if (!model) {
        return null;
      }

      if (isExpired(model)) {
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
      return NstSvcCacheDb.set(this.namespace, key);
    }

    CacheProvider.prototype.set = function(key, value, merge) {
      if (!validateKey(key)) {
        return -1;
      }
      var extendedValue = null;
      var newValue = null;

      if (merge) {
        var oldValue = NstSvcCacheDb.get(this.namespace, key);
        if (oldValue && !isExpired(oldValue)) {
          // Merge the new value with the old one
          newValue = _.merge(value, oldValue);
        }
      }

      extendedValue = addExpiration(newValue || value);
      this.memory[key] = extendedValue;
      return NstSvcCacheDb.set(this.namespace, key, extendedValue);
    }

    CacheProvider.prototype.flush = function () {
      this.memory = {};
    }

    function validateKey(key) {
      if (!key || !_.isString(key)) {
        // console.error('The key must be a nonempty string.', key);
        return false;
      }

      return true;
    }

    function isExpired(model) {
      var expiration = model[EXPIRATION_KEY];

      if (!expiration) {
        return false;
      }

      return Date.now() > expiration
    }

    function addExpiration(model) {
      var expirationExtension = {};
      expirationExtension[EXPIRATION_KEY] = Date.now() + EXPIRATION_TIME;

      return Object.assign(expirationExtension, model);
    }


    return CacheProvider;
  }
})();
