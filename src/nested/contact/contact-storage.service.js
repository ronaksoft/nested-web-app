(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .service('NstSvcContactStorage', NstSvcContactStorage);

  /** @ngInject */
  function NstSvcContactStorage(NST_STORAGE_TYPE, NstStorage) {
    function ContactStorage(memory) {
      NstStorage.call(this, memory, 'contact');
    }

    ContactStorage.prototype = new NstStorage();
    ContactStorage.prototype.constructor = ContactStorage;

    return new ContactStorage(NST_STORAGE_TYPE.LOCAL);
  }
})();
