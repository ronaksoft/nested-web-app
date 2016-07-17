(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstStorage', NstStorage);

  /** @ngInject */
  function NstStorage($cacheFactory, $cookies,
                      localStorageService,
                      NST_STORAGE_TYPE, NST_STORAGE_EVENT,
                      NstSvcRandomize,
                      NstObservableObject) {
    /**
     * Creates an instance of NestedStorage
     *
     * @param {NST_STORAGE_TYPE}  type    Storage Type
     * @param {String}            id      Storage Identifier
     * @param {int}               timeout Storage expiration timeout
     *
     * @constructor
       */
    function Storage(type, id, timeout) {
      // Event listeners
      this.listeners = {};

      this.cache = {
        set: function (key, value) {},
        get: function (key) {},
        remove: function (key) {},
        flush: function () {}
      };

      this.id = id || NstSvcRandomize.genUniqId();

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

    Storage.prototype = new NstObservableObject();
    Storage.prototype.constructor = Storage;

    /**
     * Retrieves object from storage
     *
     * @param {string}  id        Stored object's unique identifier
     * @param {*}       defValue  Default value to be returned in case of key is unavailable
     *
     * @returns {*} Stored object or default value
     */
    Storage.prototype.get = function (id, defValue) {
      return this.cache.get(id) || defValue;
    };

    /**
     * Sets an object to storage
     *
     * @param {string}  id      Object's identifier
     * @param {*}       object  The object to be stored
     *
     * @returns {*} Stored object
     */
    Storage.prototype.set = function (id, object) {
      if (this.isValidObject(object)) {
        this.cache.set(id, object);
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.SET, { detail: { object: object, id: id } }));
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.CHANGE, { detail: { object: object, id: id } }));

        if (this.timeout > 0) {
          // TODO: Set expiration timeout function
        }
      }

      return this.get(id);
    };

    /**
     * Merges an object and its old value in storage
     *
     * @param {string}  id      Object's identifier
     * @param {*}       object  The object to be merged
     *
     * @returns {*} Stored object
     */
    Storage.prototype.merge = function (id, object) {
      var oObject = this.get(id, {});
      var tObject = (oObject.hasOwnProperty('merge') && oObject['merge'] instanceof Function) ?
        oObject.merge(object) : angular.merge(oObject, object);

      if (this.isValidObject(tObject)) {
        this.cache.set(id, tObject);
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.MERGE, { detail: { object: object, id: id } }));
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.CHANGE, { detail: { object: tObject, id: id } }));

        if (this.timeout > 0) {
          // TODO: Reset expiration timeout function
        }
      }

      return this.get(id);
    };

    /**
     * Removes an object from storage
     *
     * @param {string}  id      Object's identifier
     *
     * @returns {boolean} Remove success
     */
    Storage.prototype.remove = function (id) {
      var object = this.get(id);

      var result = this.cache.remove(id);
      if (result) {
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.REMOVE, { detail: { object: object, id: id } }));
      }

      return result;
    };

    /**
     * Removes all objects from storage
     *
     * @returns {boolean} Remove success
     */
    Storage.prototype.flush = function () {
      var result = this.cache.flush();
      if (result) {
        this.dispatchEvent(new CustomEvent(NST_STORAGE_EVENT.FLUSH));
      }

      return result;
    };

    Storage.prototype.isValidObject = function (object) {
      return true;
    };

    return Storage;
  }
})();
