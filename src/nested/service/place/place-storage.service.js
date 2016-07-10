(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPlaceStorage', NstSvcPlaceStorage);

  /** @ngInject */
  function NstSvcPlaceStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
