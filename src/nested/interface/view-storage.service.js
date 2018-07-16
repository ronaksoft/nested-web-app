(function() {
  'use strict';
  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcViewStorage', NstSvcViewStorage);

  /** @ngInject */
  function NstSvcViewStorage(NST_STORAGE_TYPE, NstStorage) {

    function ViewStorage() {
    }

    ViewStorage.prototype = new NstStorage(NST_STORAGE_TYPE.LOCAL, 'view');
    ViewStorage.prototype.constructor = ViewStorage;

    return new ViewStorage();
  }
})();
