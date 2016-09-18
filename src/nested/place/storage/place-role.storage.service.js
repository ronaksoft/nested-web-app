(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceRoleStorage', NstSvcPlaceRoleStorage);

  /** @ngInject */
  function NstSvcPlaceRoleStorage(NST_STORAGE_TYPE, NstStorage) {
    function PlaceRoleStorage(memory) {
      NstStorage.call(this, memory, 'place_role');
    }

    PlaceRoleStorage.prototype = new NstStorage();
    PlaceRoleStorage.prototype.constructor = PlaceRoleStorage;

    return new PlaceRoleStorage(NST_STORAGE_TYPE.LOCAL);
  }
})();
