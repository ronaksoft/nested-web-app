(function() {
  'use strict';
  angular
    .module('ronak.nested.web.user')
    .service('NstSvcInvitationStorage', NstSvcInvitationStorage);

  /** @ngInject */
  function NstSvcInvitationStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.MEMORY, 'invitation');
  }
})();
