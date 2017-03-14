(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcDownloadTokenStorage', NstSvcDownloadTokenStorage);

  /** @ngInject */
  function NstSvcDownloadTokenStorage($log, NST_STORAGE_TYPE, NstStorage, NstStoreToken) {
    function DownloadTokenStorage(memory) {
      NstStorage.call(this, memory, 'download_token');
    }

    DownloadTokenStorage.prototype = new NstStorage();
    DownloadTokenStorage.prototype.constructor = DownloadTokenStorage;

    DownloadTokenStorage.prototype.serialize = function (token) {
      return token.toString();
    }

    DownloadTokenStorage.prototype.deserialize = function (token) {
      if (_.isString(token) && _.size(token) > 0) {
        return new NstStoreToken(token);
      }

      return null;
    }

    return new DownloadTokenStorage(NST_STORAGE_TYPE.LOCAL);
  }
})();
