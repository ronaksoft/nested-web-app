(function() {
  'use strict';
  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcI18nStorage', NstSvcI18nStorage);

  /** @ngInject */
  function NstSvcI18nStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.LOCAL, 'i18n');
  }
})();
