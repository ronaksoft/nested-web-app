(function() {
  'use strict';
  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcViewStorage', NstSvcViewStorage);

  /** @ngInject */
  function NstSvcViewStorage(NST_STORAGE_TYPE, NstStorage, NstSvcServer) {

    function ViewStorage() {
      this.places = {};
      this.myPlacesId = [];
      this.page = 0;
      getMyPlaces();
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

    function getAllPlaces(skip, limit) {
      return NstSvcServer.request('account/get_all_places', {
        with_children: true,
        skip: skip,
        limit: limit
      });
    }

    function getMyPlaces() {
      var limit = 100;
      getAllPlaces(service.page * limit, service.limit).then(function (res) {
        res.places.forEach(function (place) {
          service.myPlacesId.push(place._id);
        });
        if (res.places.length === limit) {
          service.page++;
          getMyPlaces();
        }
      });
    }

    var service = new ViewStorage();
    return service;
  }
})();
