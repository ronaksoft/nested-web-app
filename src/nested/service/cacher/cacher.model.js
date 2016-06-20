(function() {
  'use strict';

  angular
    .module('nested')
    .constant('CACHE_STORAGE', {
      LOCAL: 'localStorage',
      SESSION: 'sessionStorage',
      MEMORY: 'memory',
      COOKIE: 'cookie'
    })
    .factory('NestedCacher', NestedCacher);

  /** @ngInject */
  function NestedCacher($q, $cacheFactory, $cookies,
                        localStorageService,
                        CACHE_STORAGE) {
    function Cacher(id, storage) {
      this.cache = {
        set: function (key, value) {},
        get: function (key, defValue) {}
      };

      switch (storage) {
        case CACHE_STORAGE.LOCAL:
        case CACHE_STORAGE.SESSION:
          this.cache.set = function (key, value) {
            return localStorageService.set(id + '_._' + key, value);
          };
          this.cache.get = function (key, defValue) {
            return localStorageService.get(id + '_._' + key) || defValue;
          };
          break;

        case CACHE_STORAGE.MEMORY:
          $cacheFactory(id);
          this.cache.set = function (key, value) {
            if ($cacheFactory(id)) {
              return $cacheFactory(id).set(key, value);
            }

            return false;
          };
          this.cache.get = function (key, defValue) {
            if ($cacheFactory(id)) {
              return $cacheFactory(id).get(key) || defValue;
            }

            return defValue;
          };
          break;

        case CACHE_STORAGE.COOKIE:
          this.cache.set = function (key, value) {
            return $cookies.put(key, value);

          };
          this.cache.get = function (key, defValue) {
            return $cookies.get(key) || defValue;
          };
          break;
      }

      this.fetchFn = function (id) {
        return {};
      };
    }

    Cacher.prototype = {
      put: function (id, object) {
        this.cache.set(id, object);

        return this.get(id);
      },

        /**
         *
         * @param {string}  id    Cached object's unique identifier
         * @param {boolean} fetch
         *                      value  | result
         *                     ------- | --------
         *                  undefined  | Return cached object if exists or fetch it
         *                      true   | Force to fetch object whether if already cached object or not
         *                      false  | Do not fetch object in case of it is unavailable in cache at all
         *
         * @returns {Promise} Promise which resolves with cached object as input or rejected with requested id as input
         */
      get: function (id, fetch, defValue) {
        var object = this.cache.get(id, defValue);
        if (object && !fetch) {
          return $q(function (res) {
            res(this.cached);
          }.bind({ cached: object, id: id }));
        }

        if (false === fetch) {
          return $q(function (res, rej) {
            rej(this.id);
          }.bind({ id: id }));
        }

        return this.fetchFn(id).then(function (object) {
          return this.put(id, object);
        }.bind(this));
      },

      /**
       *
       * @param {function} fn parameter is 'id' return is a 'promise' that then object
       */
      setFetchFunction: function (fn) {
        this.fetchFn = fn;
      }
    };

    return Cacher;
  }

})();
