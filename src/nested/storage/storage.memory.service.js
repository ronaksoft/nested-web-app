(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstMemoryStorage', NstMemoryStorage);

  /** @ngInject */
  function NstMemoryStorage($cacheFactory) {
    function MemoryStorage(name) {
      if (!name) {
        throw 'A MemoryStorage must have a unique name.';
      }
      this.name = name;
      this.cache = $cacheFactory(name);
    }

    MemoryStorage.prototype.constructor = MemoryStorage;

    MemoryStorage.prototype.set = set;
    MemoryStorage.prototype.get = get;
    MemoryStorage.prototype.remove = remove;
    MemoryStorage.prototype.flush = flush;

    function set(key, value) {
      this.cache.put(key, value);

      return value;
    }

    function get(key) {
      return this.cache.get(key);
    }

    function remove(key) {
      this.cache.remove(key);
    }

    function flush() {
      this.cache.removeAll();
    }

    return MemoryStorage;
  }
})();
