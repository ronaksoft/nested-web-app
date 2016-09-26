(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstStorage', NstStorage);

  /** @ngInject */
  function NstStorage($cacheFactory, $cookies, $log,
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
      var storage = this;
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
            var serializedValue = storage.serialize(value);
            return localStorageService.set(storage.id + '.' + key, serializedValue);
          };
          this.cache.get = function (key) {
            var serializedValue = localStorageService.get(storage.id + '.' + key);
            return storage.deserialize(serializedValue);
          };
          this.cache.remove = function (key) {
            return localStorageService.remove(storage.id + '.' + key);
          };
          this.cache.flush = function () {
            var patKeys = new RegExp('^' + storage.id + "\\.");

            return localStorageService.clearAll(patKeys);
          };
          break;

        case NST_STORAGE_TYPE.MEMORY:
          $cacheFactory(this.id);
          this.cache.set = function (key, value) {
            if ($cacheFactory.get(storage.id)) {
              return $cacheFactory.get(storage.id).put(key, value);
            }

            return false;
          };
          this.cache.get = function (key) {
            if ($cacheFactory.get(storage.id)) {
              return $cacheFactory.get(storage.id).get(key);
            }

            return undefined;
          };
          this.cache.remove = function (key) {
            if ($cacheFactory.get(storage.id)) {
              return $cacheFactory.get(storage.id).remove(key);
            }

            return false;
          };
          this.cache.flush = function () {
            if ($cacheFactory.get(storage.id)) {
              return $cacheFactory.get(storage.id).removeAll();
            }

            return false;
          };
          break;

        case NST_STORAGE_TYPE.COOKIE:
          this.cache.set = function (key, value) {
            return $cookies.put(storage.id + '.' + key, value);
          };
          this.cache.get = function (key) {
            return $cookies.get(storage.id + '.' + key);
          };
          this.cache.remove = function (key) {
            return $cookies.remove(storage.id + '.' + key);
          };
          this.cache.flush = function () {
            var all = $cookies.getAll();
            var result = true;
            for (var k in all) {
              if (0 == k.indexOf(storage.id + '.')) {
                result = result && $cookies.remove(k);
              }
            }

            return result;
          };
          break;
      }

      NstObservableObject.call(this);
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
      var tObject = (oObject['merge'] && oObject['merge'] instanceof Function) ?
        oObject.merge(object) : angular.extend(oObject, object);

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

    Storage.prototype.serialize = function (obj) {
      return JSON.stringify(obj);
    }

    Storage.prototype.deserialize = function (content) {
      var obj = null;
      try {
        var obj = JSON.parse(content);
      } catch (error) {
        if (error instanceof SyntaxError) {
          $log.debug('An error occured in parsing JSON', error);
        }
      }
      return obj;
    }



    return Storage;
  }
})();
