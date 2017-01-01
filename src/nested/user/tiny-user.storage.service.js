(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .service('NstSvcTinyUserStorage', NstSvcTinyUserStorage);

  /** @ngInject */
  function NstSvcTinyUserStorage($log, NST_STORAGE_TYPE, NstStorage) {
    function TinyUserStorage(memory) {
      NstStorage.call(this, memory, 'tiny_user');
    }

    TinyUserStorage.prototype = new NstStorage();
    TinyUserStorage.prototype.constructor = TinyUserStorage;

    TinyUserStorage.prototype.isValidObject = function (object) {

      var q = {
        id: object.id,
        firstName: object.firstName,
        lastName: object.lastName,
        picture: object.picture
      };
      for (var k in q) {
        if (undefined == q[k]) {
          $log.debug('Unable to store TinyUser because ', '`' + k + '`', 'was undefined:', object);

          return false;
        }
      }

      return true;
    };

    return new TinyUserStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
