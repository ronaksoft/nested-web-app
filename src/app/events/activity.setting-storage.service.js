(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivitySettingStorage', NstSvcActivitySettingStorage);

  /** @ngInject */
  function NstSvcActivitySettingStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.LOCAL, 'activity_setting');
  }
})();
