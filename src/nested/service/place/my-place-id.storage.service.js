(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcMyPlaceIdStorage', NstSvcMyPlaceIdStorage);

  /** @ngInject */
  function NstSvcMyPlaceIdStorage($log, NST_STORAGE_TYPE, NstStorage, NstSvcTinyMyPlaceIdStorage) {
    function MyPlaceIdStorage(memory) {
      NstStorage.call(this, memory, 'my_place_id');
    }

    MyPlaceIdStorage.prototype = new NstStorage();
    MyPlaceIdStorage.prototype.constructor = MyPlaceIdStorage;

    return new MyPlaceIdStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
