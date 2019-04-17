(function() {
  'use strict';
  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcViewStorage', NstSvcViewStorage);

  /** @ngInject */
  function NstSvcViewStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.LOCAL, 'view');
  }
})();
