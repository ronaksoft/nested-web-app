(function() {
  'use strict';
  angular
    .module('nested')
    .service('PostStorageService', PostStorageService);

  /** @ngInject */
  function PostStorageService(STORAGE_TYPE,
                              NestedStorage) {
    return new NestedStorage(STORAGE_TYPE.MEMORY);
  }
})();
