(function() {
  'use strict';
  angular
    .module('ronak.nested.web.messages')
    .service('NstSvcMessagesSettingStorage', NstSvcMessagesSettingStorage);

  /** @ngInject */
  function NstSvcMessagesSettingStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.LOCAL, 'messages_setting');
  }
})();
