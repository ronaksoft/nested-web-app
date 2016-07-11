(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcMinimalPlaceStorage', NstSvcMinimalPlaceStorage);

  /** @ngInject */
  function NstSvcMinimalPlaceStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
