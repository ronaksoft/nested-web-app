(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcDownloadTokenStorage', NstSvcDownloadTokenStorage);

  function NstSvcDownloadTokenStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
