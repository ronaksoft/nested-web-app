(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcTinyPlaceStorage', NstSvcTinyPlaceStorage);

  /** @ngInject */
  function NstSvcTinyPlaceStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
