(function() {
  'use strict';
  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcViewStorage', NstSvcViewStorage);

  /** @ngInject */
  function NstSvcViewStorage(NST_STORAGE_TYPE, NstStorage) {

    function ViewStorage() {
      this.places = {};
    }

    ViewStorage.prototype = new NstStorage(NST_STORAGE_TYPE.LOCAL, 'view');
    ViewStorage.prototype.constructor = ViewStorage;


    ViewStorage.prototype.setByPlace = setByPlace;
    ViewStorage.prototype.getByPlace = getByPlace;

    function setByPlace(placeId, isCompact) {
      service.places[placeId] = isCompact
    }

    function getByPlace(placeId) {
      return service.places[placeId];
    }

    var service = new ViewStorage();
    return service;
  }
})();
