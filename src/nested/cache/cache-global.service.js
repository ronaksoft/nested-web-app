/**
 * @file src/nested/cache/cache-global.service.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Contains a list of cache providers and manages creation and cleaning-up of those
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-24
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .service('NstSvcGlobalCache', NstSvcGlobalCache);

  /** @ngInject */
  function NstSvcGlobalCache(_, NstSvcCacheDb, NstSvcCacheProvider) {
    function GlobalCache() {
      this.providers = {};
    }

    GlobalCache.prototype = {};
    GlobalCache.prototype.constructor = GlobalCache;

    /**
     * Clears all application cache (memory/localStorage)
     *
     */
    GlobalCache.prototype.flush = function () {
      _.forIn(this.providers, function(value) {
         value.flush();
      });

      NstSvcCacheDb.flush();
    }

    /**
     * Creates an instance of NstSvcCacheProvider and registers the instance
     *
     * @returns
     */
    GlobalCache.prototype.createProvider = function (namespace) {
      return this.providers[namespace] = new NstSvcCacheProvider(namespace);
    }

    return new GlobalCache();
  }
})();
