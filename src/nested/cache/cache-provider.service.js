/**
 * @file src/nested/cache/cache-provider.service.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Cache providers are built to manage working with a model cache
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-24
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstSvcCacheProvider', NstSvcCacheProvider);

  /** @ngInject */
  function NstSvcCacheProvider(NstSvcCacheDb, _) {
    var EXPIRATION_KEY = '__exp';
    var EXPIRATION_DURATION = 1000 * 60 * 60;
    
    /**
     * Creates an instance of NstSvcCacheProvider
     * 
     * @param {any} namespace 
     */
    function CacheProvider(namespace) {
      this.namespace = namespace;
      // The memory is designed to make speed-up reading cache values
      this.memory = {};
    }

    CacheProvider.prototype = {};
    CacheProvider.prototype.constructor = CacheProvider;

    /**
     * Returns a model associated with the given key from th provider memory cache database
     * if the model is has not been expired yet
     * 
     * @param {any} key 
     * @returns 
     */
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

    /**
     * Removes a model that has been associated with the key from both memory and cache database
     * 
     * @param {any} key 
     * @returns 
     */
    CacheProvider.prototype.remove = function(key) {
      if (!validateKey(key)) {
        return -1;
      }

      _.unset(this.memory, key);
      return NstSvcCacheDb.set(this.namespace, key);
    }

    /**
     * Stores the model with the given key in cache database and the provider memory. This method merges
     * the existing value with the new one if you set merge=true, otherwise the old value will be replaced with the new one
     * 
     * @param {any} key 
     * @param {any} value 
     * @param {any} merge 
     * @returns 
     */
    CacheProvider.prototype.set = function(key, value, options) {
      if (!validateKey(key)) {
        return -1;
      }
      var extendedValue = null;
      var newValue = null;

      if (options && options.merge) {
        var oldValue = NstSvcCacheDb.get(this.namespace, key);
        if (oldValue && !isExpired(oldValue)) {
          // Merge the new value with the old one
          newValue = _.merge(value, oldValue);
        }
      }

      var expiration = null;
      if (options && options.expiration > 0) {
        expiration = options.expiration;
      } else {
        expiration = new Date().getTime() + EXPIRATION_DURATION;
      }

      extendedValue = addExpiration(newValue || value, expiration);
      this.memory[key] = extendedValue;
      return NstSvcCacheDb.set(this.namespace, key, extendedValue);
    }

    /**
     * Cleans the provider memory
     * 
     */
    CacheProvider.prototype.flush = function () {
      this.memory = {};
    }

    /**
     * Returns tru if the given key is a nonempty string
     * 
     * @param {any} key 
     * @returns 
     */
    function validateKey(key) {
      if (!key || !_.isString(key)) {
        // console.error('The key must be a nonempty string.', key);
        return false;
      }

      return true;
    }

    /**
     * Returns true if the model has been expired. It checks the attached expiration flag to determine when the model expires
     * 
     * @param {any} model 
     * @returns 
     */
    function isExpired(model) {
      var expiration = model[EXPIRATION_KEY];

      if (!expiration) {
        return false;
      }

      return Date.now() > expiration
    }

    /**
     * Returns the model clone with an expiration property inside 
     * 
     * @param {any} model 
     * @returns 
     */
    function addExpiration(model, expiration) {
      var expirationExtension = {};
      expirationExtension[EXPIRATION_KEY] = expiration;

      return Object.assign(expirationExtension, model);
    }


    return CacheProvider;
  }
})();
