(function () {
  'use strict';

  angular
    .module('nested')
    .service('StorageFactoryService', StorageFactoryService);

  /** @ngInject */
  function StorageFactoryService(NestedStorage) {
    function StorageFactory() {
      this.storages = {};
      this.listeners = {};
    }

    StorageFactory.prototype = {
      /**
       * @param {string}       id       Storage identifier
       * @param {STORAGE_TYPE} type     Storage type
       *
       * @returns {NestedStorage}
       */
      create: function (id, type) {
        if (!this.storages.hasOwnProperty(id)) {
          this.storages[id] = new NestedStorage(type);
        }

        return this.get(id);
      },

      /**
       * @param {string} id Storage identifier
       *
       * @returns {NestedStorage}
       */
      get: function (id) {
        return this.storages[id];
      }
    };

    return new StorageFactory();
  }
})();
