(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityStorage', NstSvcActivityStorage);

  /** @ngInject */
  function NstSvcActivityStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
