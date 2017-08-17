(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstSvcCacheDb', NstSvcCacheDb);

  /** @ngInject */
  function NstSvcCacheDb($window, _, LZString, md5) {
    var NAME_PREFIX = 'cache.';
    function CacheDb(namespace) {
      this.namespace = namespace;
      this.getKey = _.partial(getKey, this.namespace);
      this.storeQueue = [];
      this.store = _.throttle(store, 2500);
    }

    CacheDb.prototype = {};
    CacheDb.prototype.constructor = CacheDb;


    CacheDb.prototype.get = function (key) {
      var storedKey = this.getKey(key);
      // Look at localStorage
      var compressedValue = $window.localStorage.getItem(storedKey);
      if (!compressedValue) {
        // Try to find it in the items that are waiting to be stored
        var queueItem = _.find(this.storeQueue, { 'key': key });
        if (queueItem && queueItem.value) {
          return queueItem.value;
        }

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

    CacheDb.prototype.set = function (key, value) {
      if (!key) {
        return -1;
      }

      if (!value) {
        // Remove the item from storeQueue if it has not been sent to localStorage yet.
        _.remove(this.storeQueue, { 'key': key });
        // Remove from localStorage
        $window.localStorage.removeItem(this.getKey(key));
        return;
      }

      // Put the item in the queue. It will be stored in localStorage in a while
      this.storeQueue.push({
        key: key,
        value: value,
      });

      this.store();
    };

    function getKey(namespace, key) {
      return NAME_PREFIX + md5.createHash(namespace + '.' + key);
    }

    function store() {
      var item = null;
      while(item = this.storeQueue.pop()) {

        var serializedValue = JSON.stringify(item.value);
        // The compressed string is 35% smaller than the original value
        // var compressedValue = LZString.compressToUTF16(serializedValue);
        $window.localStorage.setItem(this.getKey(item.key), serializedValue);
      }
    }

    
    return CacheDb;
  }
})();
