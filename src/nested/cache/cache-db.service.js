(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .factory('NstSvcCacheDb', NstSvcCacheDb);

  /** @ngInject */
  function NstSvcCacheDb($window, _) {
    var NAME_PREFIX = 'ronak.nested.web.cache.';
    function CacheDb(namespace) {
      this.namespace = namespace;
      this.getKey = _.partial(getKey, this.namespace);
    }

    CacheDb.prototype = {};
    CacheDb.prototype.constructor = CacheDb;


    CacheDb.prototype.get = function (key) {
      var serializedValue = $window.localStorage.getItem(this.getKey(key));

      return JSON.parse(serializedValue);
    };

    CacheDb.prototype.set = function (key, value) {
      var serializedValue = JSON.stringify(value);
      $window.localStorage.setItem(this.getKey(key), serializedValue);

      return serializedValue.length;
    };

    CacheDb.prototype.flush = function () {
      var namespaceRegex = new RegExp('^(' + NAME_PREFIX + this.namespace + '.)');
      _.keys(localStorage).forEach(function (key) {
        if (namespaceRegex.test(key)) {
          localStorage.removeItem(key);
        }
      });  
    }

    function getKey(namespace, key) {
      return NAME_PREFIX + namespace + '.' + key;
    }

    
    return CacheDb;
  }
})();
