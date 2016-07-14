(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcUserStorage', NstSvcUserStorage);

  /** @ngInject */
  function NstSvcUserStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
