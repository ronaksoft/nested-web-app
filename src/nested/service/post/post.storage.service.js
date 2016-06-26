(function() {
  'use strict';
  angular.module('nested').service('PostStorageService', PostStorageService);

  function PostStorageService(NestedStorage, STORAGE_TYPE) {
    return new NestedStorage('storage-post', STORAGE_TYPE.MEMORY);
  }

})();
