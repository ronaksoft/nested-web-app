(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcTinyUserStorage', NstSvcTinyUserStorage);

  /** @ngInject */
  function NstSvcTinyUserStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
