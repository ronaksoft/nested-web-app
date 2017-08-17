(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstSvcCacheProvider', NstSvcCacheProvider);

  /** @ngInject */
  function NstSvcCacheProvider(NstSvcCacheDb, _) {
    function CacheProvider(namespace) {
      this.namespace = namespace;
      this.db = new NstSvcCacheDb(this.namespace);
      this.memory = {};
    }

    CacheProvider.prototype = {};
    CacheProvider.prototype.constructor = CacheProvider;

    CacheProvider.prototype.get = function(key) {
      var value = this.memory[key];
      
      return value || this.db.get(key);
    }

    CacheProvider.prototype.remove = function(key) {
      _.unset(this.memory, key);
      this.db.set(key);
    }

    CacheProvider.prototype.set = function(key, value) {
      this.memory[key] = value;
      this.db.set(key, value);
    }

    return CacheProvider;
  }
})();
