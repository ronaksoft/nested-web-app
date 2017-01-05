(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .service('NstSvcMicroPlaceStorage', NstSvcMicroPlaceStorage);

  /** @ngInject */
  function NstSvcMicroPlaceStorage(NST_STORAGE_TYPE, NstStorage, NstSvcLogger) {
    function MicroPlaceStorage(memory) {
      NstStorage.call(this, memory, 'micro_place');
    }

    MicroPlaceStorage.prototype = new NstStorage();
    MicroPlaceStorage.prototype.constructor = MicroPlaceStorage;

    MicroPlaceStorage.prototype.isValidObject = function (object) {
      if (!object.id) {
        NstSvcLogger.debug("Could not store a micro place with an empty id");

        return false;
      }

      if (!object.name) {
        NstSvcLogger.debug("Could not store a micro place with an empty name");

        return false;
      }

      return true;
    };

    return new MicroPlaceStorage(NST_STORAGE_TYPE.MEMORY);
  }
})();
