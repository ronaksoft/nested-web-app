(function() {
  'use strict';

  angular
    .module('nested')
    .constant('CACHE_STORAGE', {
      LOCAL: 'localStorage',
      SESSION: 'sessionStorage',
      MEMORY: 'memory'
    })
    .factory('NestedCacher', NestedCacher);

  /** @ngInject */
  function NestedCacher($q, $log, CacheFactory) {
    function Cacher(id, storage) {
      this.cache = CacheFactory.createCache(id, {storage: storage});
      this.fetchFn = function (id) {
        return {};
      };
    }

    Cacher.prototype = {
      put: function (id, object) {
        this.cache.put(id, object);

        return this.get(id);
      },

        /**
         *
         * @param id
         * @param fetch boolean value  | result
         *                     ------- | --------
         *                      true   | Force to fetch object whether if already cached object or not
         *                      false  | Do not fetch object in case of it is unavailable in cache at all
         *                  undefined  | Return cached object if exists or fetch it
         * @returns {*}
         */
      get: function (id, fetch) {
        var object = this.cache.get(id);
        if (object && !fetch) {
          return $q(function (res) {
            res(this);
          }.bind(object));
        }

        if (false === fetch) {
          return $q(function (res, rej) {
            rej();
          });
        }

        return this.fetchFn(id).then(function (object) {
          return this.put(id, object);
        }.bind(this));
      },

      setFetchFunction: function (fn) {
        this.fetchFn = fn;
      }
    };

    return Cacher;
  }

})();
