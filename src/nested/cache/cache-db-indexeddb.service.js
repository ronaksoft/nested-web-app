/**
 * @file src/nested/cache/cache-db.service.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A database on top of localStorage specially designed and optimized for the project
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-24
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .service('NstSvcCacheDbIndexedDb', NstSvcCacheDbIndexedDb);

  /** @ngInject */
  function NstSvcCacheDbIndexedDb($window, _) {
    var NAME_PREFIX = 'nst.web.ang';

    function CacheDb() {
      var that = this;
      var indexedDB = $window.indexedDB || $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB || $window.shimIndexedDB;
      var openDB = indexedDB.open(NAME_PREFIX, 1);

      openDB.onerror = function (event) {
        console.log('The database is opened failed', event);
      };

      openDB.onsuccess = function () {
        that.db = openDB.result;
      };

      openDB.onclose = function (event) {
      };

      openDB.onupgradeneeded = function (event) {
        that.db = event.target.result;
        _.forEach(["draft", "contact", "sidebar_expanded_places", "app", "token", "file", "keys-data", "label", "place", "comment", "post", "scroll", "task_draft", "task", "user"], function(namespace){
          console.log(namespace);
          that.db.createObjectStore(namespace)
        })
        // var keyValStore = that.db.createObjectStore("item.namespace")
        // keyValStore.put("item.mainKey", "item.value")
      }
      this.storeQueue = [];
      this.store = _.throttle(store, 5000);
    }

    CacheDb.prototype = {};
    CacheDb.prototype.constructor = CacheDb;


    /**
     * @func get
     * 
     * Returns the object with the provided namespace and key. It looks in both storeQueue and localStorage to retrieve the object
     * 
     * @param {any} namespace 
     * @param {any} key 
     * @returns 
     */
    CacheDb.prototype.get = function (namespace, key, cb) {
      var storedKey = getKey(namespace, key);
      // Try to find it in the items that are waiting to be stored
      var queueItem = _.find(this.storeQueue, { 'key': storedKey });
      if (queueItem && queueItem.value) {
        return queueItem.value;
      }
      var keyValStore = this.db.transaction([namespace], "readwrite").objectStore(namespace)

      var req = keyValStore.get(key)
      req.onsuccess = function() {
        cb(req.result)
      }
      req.onerror = function() {
        this.set(storedKey);
        cb(null)
      }
      return req;
    };

    /**
     * Stores the value with the given namespace and key. It first pushes the item in storeQueue
     * and then writes later on
     * 
     * @param {any} namespace 
     * @param {any} key 
     * @param {any} value 
     * @returns 
     */
    CacheDb.prototype.set = function (namespace, key, value) {
      var that = this;
      if (!key) {
        return -1;
      }

      var storedKey = getKey(namespace, key);

      if (!value) {
        // Remove the item from storeQueue if it has not been sent to localStorage yet.
        _.remove(this.storeQueue, { 'key': storedKey });
        // Remove from localStorage
        // $window.localStorage.removeItem(storedKey);
        return;
      }

      // Put the item in the queue. It will be stored in localStorage in a while
      that.storeQueue.push({
        key: storedKey,
        mainKey: key,
        namespace: namespace,
        value: value
      });

      this.store();
    };

    /**
     * Flushes the cached item in both memory and localStorage
     * 
     */
    CacheDb.prototype.flush = function () {
      this.store.cancel();
      this.storeQueue.length = 0;
      _.forEach(function(namespace) {
        this.db.deleteObjectStore(namespace)
      })
    };

    /**
     * Generates a unique hash using the given namespace and key
     * 
     * @param {any} namespace 
     * @param {any} key 
     * @returns 
     */
    function getKey(namespace, key) {
      return NAME_PREFIX + namespace + '.' + key;
    }

    /**
     * Stores all items that are waiting to be written in localStorage
     * 
     */
    function store() {
      var item = this.storeQueue.pop();

      while(item) {
        var keyValStore = this.db.transaction([item.namespace], "readwrite").objectStore(item.namespace)
        keyValStore.add(item.value, item.mainKey)
        item = this.storeQueue.pop();
      }
    }



    return new CacheDb();
  }
})();
