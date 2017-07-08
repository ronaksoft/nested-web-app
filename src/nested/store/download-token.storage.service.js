(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcDownloadTokenStorage', NstSvcDownloadTokenStorage);

  /** @ngInject */
  function NstSvcDownloadTokenStorage($log, _,
    NST_STORAGE_TYPE, NstStorage, NstStoreToken) {
    function DownloadTokenStorage(memory) {
      NstStorage.call(this, memory, 'download_token');
    }

    DownloadTokenStorage.prototype = new NstStorage();
    DownloadTokenStorage.prototype.constructor = DownloadTokenStorage;

    DownloadTokenStorage.prototype.serialize = function (token) {
      return JSON.stringify(token);
    }

    DownloadTokenStorage.prototype.deserialize = function (token) {
      if (_.isString(token) && _.size(token) > 0 && token[0] == '{') {
        var tokenObj = JSON.parse(token);
        return new NstStoreToken(tokenObj.token, tokenObj.sk);
      }

      return null;
    }

    return new DownloadTokenStorage(NST_STORAGE_TYPE.LOCAL);
  }
})();
