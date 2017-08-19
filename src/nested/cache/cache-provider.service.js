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
      
      if (!model) {
        return null;
      }
      
      if (isExpired(model)) {
        this.remove(key);
        console.log('====================================');
        console.log('This is expired', model);
        console.log('====================================');
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

      var oldValue = this.db.get(key);
      var newValue = null;
      if (oldValue && !isExpired(oldValue)) {
        // Merge the new value with the old one
        newValue = _.merge(value, oldValue);
      }

      var extendedValue = addExpiration(newValue || value);

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
