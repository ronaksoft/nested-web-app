(function() {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityStorage', NstSvcActivityStorage);

  /** @ngInject */
  function NstSvcActivityStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
