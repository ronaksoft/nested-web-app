(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcCommentStorage', NstSvcCommentStorage);

  /** @ngInject */
  function NstSvcCommentStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
