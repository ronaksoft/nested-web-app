(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcUploadTokenStorage', NstSvcUploadTokenStorage);

  function NstSvcUploadTokenStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
