(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPostStorage', NstSvcPostStorage);

  /** @ngInject */
  function NstSvcPostStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
