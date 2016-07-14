(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcTinyPlaceStorage', NstSvcTinyPlaceStorage);

  /** @ngInject */
  function NstSvcTinyPlaceStorage($log, NST_STORAGE_TYPE, NstStorage) {
    function TinyPlaceStorage(memory) {
      NstStorage.call(this, memory, 'tiny_place');
    }

    TinyPlaceStorage.prototype = new NstStorage();
    TinyPlaceStorage.prototype.constructor = TinyPlaceStorage;

    TinyPlaceStorage.prototype.isValidObject = function (object) {
      var q = {
        id: object.id,
        name: object.name,
        description: object.description,
        picture: object.picture
      };
      for (var k in q) {
        if (undefined == q[k]) {
          $log.debug('Unable to store TinyPlace because ', '`' + k + '`', 'was undefined:', object);

          return false;
        }
      }

      return true;
    };

    return new TinyPlaceStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
