(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcRequestCacheFactory', NstSvcRequestCacheFactory);

  /** @ngInject */
  function NstSvcRequestCacheFactory() {

    var pipeLength = 100;

    function RequestCacheFactory() {
      this.requestKeyList = [];
    }

    RequestCacheFactory.prototype = {};
    RequestCacheFactory.prototype.constructor = RequestCacheFactory;
    RequestCacheFactory.prototype.requestKeyList = [];

    RequestCacheFactory.prototype.hasCache = hasCache;
    RequestCacheFactory.prototype.getItem = getItem;
    RequestCacheFactory.prototype.getRequestKey = getRequestKey;
    RequestCacheFactory.prototype.observeRequest = observeRequest;
    RequestCacheFactory.prototype.updateResponse = updateResponse;
    RequestCacheFactory.prototype.updateCachePosition = updateCachePosition;
    RequestCacheFactory.prototype.moveToFront = moveToFront;
    RequestCacheFactory.prototype.shortenRequestList = shortenRequestList;
    RequestCacheFactory.prototype.flush = flush;

    var factory = new RequestCacheFactory();
    return factory;

    function hasCache(key) {
      for (var i = 0; i < this.requestKeyList.length; i++) {
        if (this.requestKeyList[i].key === key) {
          return i;
        }
      }
      return -1;
    }

    function getItem(key) {
      var index = this.hasCache(key);
      if (index > -1) {
        return this.requestKeyList[index];
      } else {
        return null;
      }
    }

    function getRequestKey(cmd, data) {
      var requestKeyJson = {
        cmd: cmd,
        data: data
      };
      return JSON.stringify(requestKeyJson);
    }

    function observeRequest(cmd, data) {
      var requestKey = this.getRequestKey(cmd, data);
      var item = this.getItem(requestKey);
      if (item === null) {
        this.shortenRequestList();
        this.requestKeyList.push({
          key: requestKey,
          cmd: cmd,
          param: data,
          response: null
        });
        return null;
      } else if (item.response === null) {
        this.updateCachePosition(requestKey);
        return null;
      } else {
        this.updateCachePosition(requestKey);
        return item.response;
      }
    }

    function updateResponse(cmd, data, res) {
      var requestKey = this.getRequestKey(cmd, data);
      var index = this.hasCache(requestKey);
      if (index > -1) {
        this.requestKeyList[index].response = res;
      }
    }

    function updateCachePosition(key) {
      var index = this.hasCache(key);
      if (index > -1) {
        this.moveToFront(index);
      }
    }

    function moveToFront(index) {
      var collection = this.requestKeyList;
      collection = collection.splice(index, 1).concat(collection);
      this.requestKeyList = collection;
    }

    function shortenRequestList() {
      while (this.requestKeyList.length >= pipeLength) {
        this.requestKeyList.pop();
      }
    }

    function flush() {
      while (this.requestKeyList.length > 0) {
        this.requestKeyList.pop();
      }
    }
  }
})
();
