(function() {
  'use strict';
  angular
    .module('ronak.nested.web.comment')
    .service('NstSvcCommentStorage', NstSvcCommentStorage);

  /** @ngInject */
  function NstSvcCommentStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
