(function () {
  'use strict';

  angular
    .module('nested')
    .service('CacherFactoryService', CacherFactoryService);

  /** @ngInject */
  function CacherFactoryService(NestedCacher) {
    function CacherFactory() {
      this.cachers = {};
      this.listeners = {};
    }

    CacherFactory.prototype = {
      /**
       * @param {string}        id       Cacher identifier
       * @param {CACHE_STORAGE} storage  Cacher storage type
       *
       * @returns {NestedCacher}
       */
      create: function (id, storage) {
        if (!this.cachers.hasOwnProperty(id)) {
          this.cachers[id] = new NestedCacher(id, storage);
        }

        return this.get(id);
      },

      /**
       * @param {string} id Cacher identifier
       *
       * @returns {NestedCacher}
       */
      get: function (id) {
        return this.cachers[id];
      }

    };

    return new CacherFactory();
  }

})();
