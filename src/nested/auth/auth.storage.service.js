(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .service('NstSvcAuthStorage', NstSvcAuthStorage);

  /** @ngInject */
  function NstSvcAuthStorage(NST_STORAGE_TYPE, NstStorage) {
    function AuthStorage(memory) {
      NstStorage.call(this, memory, 'auth');
    }

    AuthStorage.prototype = new NstStorage();
    AuthStorage.prototype.constructor = AuthStorage;

    return new AuthStorage(NST_STORAGE_TYPE.SESSION);
  }
})();
