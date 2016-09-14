(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcUploadTokenStorage', NstSvcUploadTokenStorage);

  /** @ngInject */
  function NstSvcUploadTokenStorage($log, NST_STORAGE_TYPE, NstStorage) {
    function UploadTokenStorage(memory) {
      NstStorage.call(this, memory, 'upload_token');
    }

    UploadTokenStorage.prototype = new NstStorage();
    UploadTokenStorage.prototype.constructor = UploadTokenStorage;

    UploadTokenStorage.prototype.isValidObject = function (object) {
      var q = {
        string: object.string
      };
      for (var k in q) {
        if (undefined == q[k]) {
          $log.debug('Unable to store UploadToken because ', '`' + k + '`', 'was undefined:', object);

          return false;
        }
      }

      return true;
    };

    return new UploadTokenStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
