(function() {
  'use strict';
  angular
    .module('ronak.nested.web.messages')
    .service('NstSvcPostStorage', NstSvcPostStorage);

  /** @ngInject */
  function NstSvcPostStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
