(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .service('NstSvcGlobalCache', NstSvcGlobalCache);

  /** @ngInject */
  function NstSvcGlobalCache(NstSvcCacheDb, NstSvcCacheProvider) {
    function GlobalCache() {
      this.providers = {};
    }

    GlobalCache.prototype = {};
    GlobalCache.prototype.constructor = GlobalCache;

    GlobalCache.prototype.flush = function () {
      _.forIn(this.providers, function(value) {
         value.flush();
      });

      NstSvcCacheDb.flush();
    }

    GlobalCache.prototype.createProvider = function (namespace) {
      return this.providers[namespace] = new NstSvcCacheProvider(namespace);
    }

    return new GlobalCache();
  }
})();
