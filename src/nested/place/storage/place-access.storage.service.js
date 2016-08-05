(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPlaceAccessStorage', NstSvcPlaceAccessStorage);

  /** @ngInject */
  function NstSvcPlaceAccessStorage(NST_STORAGE_TYPE, NstStorage) {
    function PlaceAccessStorage(memory) {
      NstStorage.call(this, memory, 'place_access');
    }

    PlaceAccessStorage.prototype = new NstStorage();
    PlaceAccessStorage.prototype.constructor = PlaceAccessStorage;

    return new PlaceAccessStorage(NST_STORAGE_TYPE.LOCAL);
  }
})();
