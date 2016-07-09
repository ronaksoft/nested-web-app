(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_STORAGE_TYPE', {
      LOCAL: 'localStorage',
      SESSION: 'sessionStorage',
      MEMORY: 'memory',
      COOKIE: 'cookie'
    })
    .constant('NST_STORAGE_EVENT', {
      SET: 'set',
      MERGE: 'merge',
      CHANGE: 'change',
      EXPIRE: 'expire',
      REMOVE: 'remove',
      FLUSH: 'flush'
    })
    .factory('NstStorage', NstStorage);

  /** @ngInject */
  function NstStorage($cacheFactory, $cookies,
                         localStorageService,
                         NST_STORAGE_TYPE, NST_STORAGE_EVENT,
                         NstSvcRandomize) {
    /**
     * Creates an instance of NestedStorage
     *
     * @param {STORAGE_TYPE}  type    Storage Type
     * @param {int}           timeout Storage expiration timeout
     *
     * @constructor
       */
    function Storage(type, timeout) {
      // Event listeners
      this.listeners = {};

      this.cache = {
        set: function (key, value) {},
        get: function (key) {},
        remove: function (key) {},
        flush: function () {}
      };

      this.id = NstSvcRandomize.genUniqId();

      this.timeout = timeout || 0;

      switch (type) {
        case NST_STORAGE_TYPE.LOCAL:
        case NST_STORAGE_TYPE.SESSION:
          this.cache.set = function (key, value) {
            return localStorageService.set(this.id + '.' + key, value);
          }.bind(this);
          this.cache.get = function (key) {
            return localStorageService.get(this.id + '.' + key);
          }.bind(this);
          this.cache.remove = function (key) {
            return localStorageService.remove(this.id + '.' + key);
          }.bind(this);
          this.cache.flush = function () {
            var all = localStorageService.keys();
            var result = true;
            for (var k in all) {
              if (0 == k.indexOf(this.id + '.')) {
                result = result && localStorageService.remove(k);
              }
            }

            return result;
          }.bind(this);
          break;

        case NST_STORAGE_TYPE.MEMORY:
          $cacheFactory(this.id);
          this.cache.set = function (key, value) {
            if ($cacheFactory.get(this.id)) {
              return $cacheFactory.get(this.id).put(key, value);
            }

            return false;
          }.bind(this);
          this.cache.get = function (key) {
            if ($cacheFactory.get(this.id)) {
              return $cacheFactory.get(this.id).get(key);
            }

            return undefined;
          }.bind(this);
          this.cache.remove = function (key) {
            if ($cacheFactory.get(this.id)) {
              return $cacheFactory.get(this.id).remove(key);
            }

            return false;
          }.bind(this);
          this.cache.flush = function () {
            if ($cacheFactory.get(this.id)) {
              return $cacheFactory.get(this.id).removeAll();
            }

            return false;
          }.bind(this);
          break;

        case NST_STORAGE_TYPE.COOKIE:
          this.cache.set = function (key, value) {
            return $cookies.put(this.id + '.' + key, value);
          }.bind(this);
          this.cache.get = function (key) {
            return $cookies.get(this.id + '.' + key);
          }.bind(this);
          this.cache.remove = function (key) {
            return $cookies.remove(this.id + '.' + key);
          }.bind(this);
          this.cache.flush = function () {
            var all = $cookies.getAll();
            var result = true;
            for (var k in all) {
              if (0 == k.indexOf(this.id + '.')) {
                result = result && $cookies.remove(k);
              }
            }

            return result;
          }.bind(this);
          break;
      }
    }

    Storage.prototype = {
      /**
       * Retrieves object from storage
       *
       * @param {string}  id        Stored object's unique identifier
       * @param {*}       defValue  Default value to be returned in case of key is unavailable
       *
       * @returns {*} Stored object or default value
       */
      get: function (id, defValue) {
        return this.cache.get(id) || defValue;
      },

      /**
       * Sets an object to storage
       *
       * @param {string}  id      Object's identifier
       * @param {*}       object  The object to be stored
       *
       * @returns {*} Stored object
       */
      set: function (id, object) {
        this.cache.set(id, object);
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.SET, { detail: { object: object, id: id } }));
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.CHANGE, { detail: { object: object, id: id } }));

        if (this.timeout > 0) {
          // TODO: Set expiration timeout function
        }

        return this.get(id);
      },

      /**
       * Merges an object and its old value in storage
       *
       * @param {string}  id      Object's identifier
       * @param {*}       object  The object to be merged
       *
       * @returns {*} Stored object
       */
      merge: function (id, object) {
        this.cache.set(id, angular.merge(this.get(id, {}), object));
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.MERGE, { detail: { object: object, id: id } }));
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.CHANGE, { detail: { object: object, id: id } }));

        if (this.timeout > 0) {
          // TODO: Reset expiration timeout function
        }

        return this.get(id);
      },

      /**
       * Removes an object from storage
       *
       * @param {string}  id      Object's identifier
       *
       * @returns {boolean} Remove success
       */
      remove: function (id) {
        var object = this.get(id);

        var result = this.cache.remove(id);
        if (result) {
          this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.REMOVE, { detail: { object: object, id: id } }));
        }

        return result;
      },

      /**
       * Removes all objects from storage
       *
       * @returns {boolean} Remove success
       */
      flush: function () {
        var result = this.cache.flush();
        if (result) {
          this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.FLUSH));
        }

        return result;
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
