(function() {
  'use strict';
  angular
    .module('ronak.nested.web')
    .service('NstSvcKeyStorage', NstSvcKeyStorage);

  /** @ngInject */
  function NstSvcKeyStorage(NST_STORAGE_TYPE, NstStorage) {
    function ContactStorage(memory) {
      NstStorage.call(this, memory, 'key');
    }

    ContactStorage.prototype = new NstStorage();
    ContactStorage.prototype.constructor = ContactStorage;

    return new ContactStorage(NST_STORAGE_TYPE.LOCAL);
  }
})();
