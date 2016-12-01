(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcFileStorage', NstSvcFileStorage);

  /** @ngInject */
  function NstSvcFileStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY, 'file');
  }
})();
