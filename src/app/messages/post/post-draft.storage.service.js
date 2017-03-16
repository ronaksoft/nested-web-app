(function() {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcPostDraftStorage', NstSvcPostDraftStorage);

  /** @ngInject */
  function NstSvcPostDraftStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.LOCAL, "post.draft");
  }
})();
