(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPlaceStorage', NstSvcPlaceStorage);

  /** @ngInject */
  function NstSvcPlaceStorage($log, NST_STORAGE_TYPE, NstStorage, NstSvcTinyPlaceStorage) {
    function PlaceStorage(memory) {
      NstStorage.call(this, memory, 'place');
    }

    PlaceStorage.prototype = new NstStorage();
    PlaceStorage.prototype.constructor = PlaceStorage;

    PlaceStorage.prototype.isValidObject = function (object) {
      var q = {
        isTiny: NstSvcTinyPlaceStorage.isValidObject(object) ? true : undefined
      };
      for (var k in q) {
        if (undefined == q[k]) {
          $log.debug('Unable to store Place because ', '`' + k + '`', 'was undefined:', object);

          return false;
        }
      }

      return true;
    };

    return new PlaceStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
