(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common.cache')
    .service('NstSvcStorageFactory', NstSvcStorageFactory);

  /** @ngInject */
  function NstSvcStorageFactory(NstStorage) {
    function StorageFactory() {
      this.storages = {};
      this.listeners = {};
    }

    StorageFactory.prototype = {
      /**
       * @param {string}            id    Storage identifier
       * @param {NST_STORAGE_TYPE}  type  Storage type
       *
       * @returns {NstStorage}
       */
      create: function (id, type) {
        if (!this.storages.hasOwnProperty(id)) {
          this.storages[id] = new NstStorage(type);
        }

        return this.get(id);
      },

      /**
       * @param {string} id Storage identifier
       *
       * @returns {NstStorage}
       */
      get: function (id) {
        return this.storages[id];
      }
    };

    return new StorageFactory();
  }
})();
