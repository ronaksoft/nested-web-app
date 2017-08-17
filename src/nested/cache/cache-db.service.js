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
    }

    CacheDb.prototype = {};
    CacheDb.prototype.constructor = CacheDb;


    CacheDb.prototype.get = function (key) {
      var storedKey = this.getKey(key);
      var compressedValue = $window.localStorage.getItem(storedKey);
      if (!compressedValue) {
        return null;
      }

      var decompressedValue = LZString.decompressFromUTF16(compressedValue);
      var value = null;
      try {
        value = JSON.parse(decompressedValue)
      } catch (error) {
        // removes the invalid data
        this.set(storedKey);
      }
      return value;
    };

    CacheDb.prototype.set = function (key, value) {
      if (!key) {
        return -1;
      }

      if (!value) {
        $window.localStorage.removeItem(this.getKey(key));
        return 0;
      }

      var serializedValue = JSON.stringify(value);
      // The compressed string is 35% smaller than the original value
      var compressedValue = LZString.compressToUTF16(serializedValue);
      $window.localStorage.setItem(this.getKey(key), compressedValue);

      return serializedValue.length;
    };

    function getKey(namespace, key) {
      return NAME_PREFIX + md5.createHash(namespace + '.' + key);
    }

    
    return CacheDb;
  }
})();
