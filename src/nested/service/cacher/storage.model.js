(function() {
  'use strict';

  angular
    .module('nested')
    .constant('STORAGE_TYPE', {
      LOCAL: 'localStorage',
      SESSION: 'sessionStorage',
      MEMORY: 'memory',
      COOKIE: 'cookie'
    })
    .constant('STORAGE_EVENT', {
      PUT: 'put'
    })
    .factory('NestedStorage', NestedStorage);

  /** @ngInject */
  function NestedStorage($q, $cacheFactory, $cookies,
                         localStorageService,
                         STORAGE_TYPE, STORAGE_EVENT) {
    function Storage(id, type) {
      // Event listeners
      this.listeners = {};

      this.cache = {
        set: function (key, value) {},
        get: function (key, defValue) {}
      };

      switch (type) {
        case STORAGE_TYPE.LOCAL:
        case STORAGE_TYPE.SESSION:
          this.cache.set = function (key, value) {
            return localStorageService.set(id + '_._' + key, value);
          };
          this.cache.get = function (key, defValue) {
            return localStorageService.get(id + '_._' + key) || defValue;
          };
          break;

        case STORAGE_TYPE.MEMORY:
          $cacheFactory(id);
          this.cache.set = function (key, value) {
            if ($cacheFactory.get(id)) {
              return $cacheFactory.get(id).put(key, value);
            }

            return false;
          };
          this.cache.get = function (key, defValue) {
            if ($cacheFactory.get(id)) {
              return $cacheFactory.get(id).get(key) || defValue;
            }

            return defValue;
          };
          break;

        case STORAGE_TYPE.COOKIE:
          this.cache.set = function (key, value) {
            return $cookies.put(key, value);
          };
          this.cache.get = function (key, defValue) {
            return $cookies.get(key) || defValue;
          };
          break;
      }

      this.fetchFn = function (id) {
        return $q(function (res, rej) {
          rej();
        });
      };
    }

    Storage.prototype = {
      /**
       * Puts an object to storage
       *
       * @param {string}  id      Object's identifier
       * @param {*}       object  The object to be stored
       *
       * @returns {Promise}
       */
      put: function (id, object) {
        this.cache.set(id, object);
        this.dispatchEvent(new CustomEvent(STORAGE_EVENT.PUT, { detail: { object: object, id: id } }));

        return this.get(id);
      },

        /**
         * Retrieves object from storage
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
       * @param {function} fn Function which accepts `id` as input and returns Promise which resolves with fetched object as input or rejected with `id` as input
       */
      setFetchFunction: function (fn) {
        this.fetchFn = fn;
      },

      /**
       * Registers listener to an event
       *
       * @param {STORAGE_EVENT} type      Event name
       * @param {function}      callback  Listener function
       * @param {boolean}       oneTime   Whether if listener should be removed after first call or not
       */
      addEventListener: function (type, callback, oneTime) {
        if (!(type in this.listeners)) {
          this.listeners[type] = [];
        }

        this.listeners[type].push({
          flush: oneTime || false,
          fn: callback
        });
      },

      /**
       * Unregisters listener from an event
       *
       * @param {STORAGE_EVENT} type      Event name
       * @param {function}      callback  Listener function
       *
       * @returns {*}
       */
      removeEventListener: function (type, callback) {
        if (!(type in this.listeners)) {
          return;
        }

        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
          if (stack[i].fn === callback) {
            stack.splice(i, 1);

            return this.removeEventListener(type, callback);
          }
        }
      },

      /**
       * Triggers event
       *
       * @param {STORAGE_EVENT} event Event name
       *
       * @returns {*}
       */
      dispatchEvent: function (event) {
        if (!(event.type in this.listeners)) {
          return;
        }

        var stack = this.listeners[event.type];
        // event.target = this;
        var flushTank = [];
        for (var i = 0, l = stack.length; i < l; i++) {
          stack[i].fn.call(this, event);
          stack[i].flush && flushTank.push(stack[i]);
        }

        for (var key in flushTank) {
          this.removeEventListener(event.type, flushTank[key].fn);
        }
      }
    };

    return Storage;
  }
})();
