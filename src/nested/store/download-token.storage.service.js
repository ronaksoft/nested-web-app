(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcDownloadTokenStorage', NstSvcDownloadTokenStorage);

  /** @ngInject */
  function NstSvcDownloadTokenStorage($log, NST_STORAGE_TYPE, NstStorage) {
    function DownloadTokenStorage(memory) {
      NstStorage.call(this, memory, 'download_token');
    }

    DownloadTokenStorage.prototype = new NstStorage();
    DownloadTokenStorage.prototype.constructor = DownloadTokenStorage;

    DownloadTokenStorage.prototype.isValidObject = function (object) {
      var q = {
        string: object.string
      };
      for (var k in q) {
        if (undefined == q[k]) {
          $log.debug('Unable to store DownloadToken because ', '`' + k + '`', 'was undefined:', object);

          return false;
        }
      }

      return true;
    };

    return new DownloadTokenStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
