/**
 * @file src/nested/cache/cache-db.service.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A database on top of localStorage specially designed and optimized for the project
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-24
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .service('NstSvcCacheDb', NstSvcCacheDb);

  /** @ngInject */
  function NstSvcCacheDb($window, _, md5) {
    var NAME_PREFIX = 'cache.';
    function CacheDb() {
      this.storeQueue = [];
      this.store = _.throttle(store, 2500);
    }

    CacheDb.prototype = {};
    CacheDb.prototype.constructor = CacheDb;


    /**
     * @func get
     * 
     * Returns the object with the provided namespace and key. It looks in both storeQueue and localStorage to retrieve the object
     * 
     * @param {any} namespace 
     * @param {any} key 
     * @returns 
     */
    CacheDb.prototype.get = function (namespace, key) {
      var storedKey = getKey(namespace, key);
      // Try to find it in the items that are waiting to be stored
      var queueItem = _.find(this.storeQueue, { 'key': storedKey });
      if (queueItem && queueItem.value) {
        return queueItem.value;
      }
      // Look at localStorage
      var compressedValue = $window.localStorage.getItem(storedKey);
      if (!compressedValue) {

        // There is not any value associated with the provided key
        return null;
      }

      // var decompressedValue = LZString.decompressFromUTF16(compressedValue);
      var value = null;
      try {
        value = JSON.parse(compressedValue)
      } catch (error) {
        // Remove the invalid data
        this.set(storedKey);
      }
      return value;
    };

    /**
     * Stores the value with the given namespace and key. It first pushes the item in storeQueue
     * and then writes later on
     * 
     * @param {any} namespace 
     * @param {any} key 
     * @param {any} value 
     * @returns 
     */
    CacheDb.prototype.set = function (namespace, key, value) {
      if (!key) {
        return -1;
      }

      var storedKey = getKey(namespace, key);

      if (!value) {
        // Remove the item from storeQueue if it has not been sent to localStorage yet.
        _.remove(this.storeQueue, { 'key': storedKey });
        // Remove from localStorage
        $window.localStorage.removeItem(storedKey);
        return;
      }

      // Put the item in the queue. It will be stored in localStorage in a while
      this.storeQueue.push({
        key: storedKey,
        value: value
      });

      this.store();
    };

    /**
     * Flushes the cached item in both memory and localStorage
     * 
     */
    CacheDb.prototype.flush = function () {
      this.store.cancel();
      this.storeQueue.length = 0;
      _.forIn($window.localStorage, function(value, key) {
        if (_.startsWith(key, NAME_PREFIX)) {
          // TODO: Why removes all keys?
          $window.localStorage.removeItem(key);
        }
      });
    };

    /**
     * Generates a unique hash using the given namespace and key
     * 
     * @param {any} namespace 
     * @param {any} key 
     * @returns 
     */
    function getKey(namespace, key) {
      return NAME_PREFIX + md5.createHash(namespace + '.' + key);
    }

    /**
     * Stores all items that are waiting to be written in localStorage
     * 
     */
    function store() {
      var item = this.storeQueue.pop();
      while(item) {

        var serializedValue = JSON.stringify(item.value);
        // The compressed string is 35% smaller than the original value
        // var compressedValue = LZString.compressToUTF16(serializedValue);
        $window.localStorage.setItem(item.key, serializedValue);
        item = this.storeQueue.pop();
      }
    }



    return new CacheDb();
  }
})();
