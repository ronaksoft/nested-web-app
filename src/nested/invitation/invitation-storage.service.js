(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcInvitationStorage', NstSvcInvitationStorage);

  /** @ngInject */
  function NstSvcInvitationStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
