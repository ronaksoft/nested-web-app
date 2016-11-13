(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcFileTokenStorage', NstSvcFileTokenStorage);

  /** @ngInject */
  function NstSvcFileTokenStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.LOCAL, 'file-token');
  }
})();
