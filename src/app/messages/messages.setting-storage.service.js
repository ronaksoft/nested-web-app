(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcMessageSettingStorage', NstSvcMessageSettingStorage);

  /** @ngInject */
  function NstSvcMessageSettingStorage(NST_STORAGE_TYPE, NstStorage) {
    return new NstStorage(NST_STORAGE_TYPE.LOCAL);
  }
})();
