(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcUserStorage', NstSvcUserStorage);

  /** @ngInject */
  function NstSvcUserStorage($log, NST_STORAGE_TYPE, NstStorage, NstSvcTinyUserStorage) {
    function UserStorage(memory) {
      NstStorage.call(this, memory, 'user');
    }

    UserStorage.prototype = new NstStorage();
    UserStorage.prototype.constructor = UserStorage;

    UserStorage.prototype.isValidObject = function (object) {
      var q = {
        isTiny: NstSvcTinyUserStorage.isValidObject(object) ? true : undefined
      };
      for (var k in q) {
        if (undefined == q[k]) {
          $log.debug('Unable to store User because ', '`' + k + '`', 'was undefined:', object);

          return false;
        }
      }

      return true;
    };

    return new UserStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
