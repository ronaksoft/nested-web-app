(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcCompactViewStorage', NstSvcCompactViewStorage);

  /** @ngInject */
  function NstSvcCompactViewStorage(NST_STORAGE_TYPE, NstStorage, NstSvcServer, $q, NstSvcKeyFactory, NST_KEY) {

    var keyName = 'compactView';
    var page = 0;
    var limit = 100;

    function CompactViewStorage() {
      this.places = {};
      this.myPlacesId = [];
      this.storage = new NstStorage(NST_STORAGE_TYPE.LOCAL, 'view');
      var jsonEncoded = this.storage.get(keyName);
      if (jsonEncoded) {
        this.places = JSON.parse(jsonEncoded);
      }
      NstSvcKeyFactory.get(NST_KEY.GENERAL_COMPACT_VIEW).then(function (data) {
        if (data) {
          service.places = JSON.parse(data);
          service.storage.set(keyName, data);
        }
      });
    }

    CompactViewStorage.prototype.constructor = CompactViewStorage;

    CompactViewStorage.prototype.setByPlace = setByPlace;
    CompactViewStorage.prototype.getByPlace = getByPlace;


    function setByPlace(placeId, isCompact) {
      service.places[placeId] = isCompact;
      saveViews();
    }

    function getByPlace(placeId) {
      return service.places[placeId] || false;
    }

    function getAllPlaces(skip, limit) {
      return NstSvcServer.request('account/get_all_places', {
        with_children: true,
        skip: skip,
        limit: limit
      });
    }

    function getMyPlaces(deferred) {
      if (!deferred) {
        deferred = $q.defer();
      }
      getAllPlaces(page * limit, limit).then(function (res) {
        res.places.forEach(function (place) {
          service.myPlacesId.push(place._id);
        });
        if (res.places.length === limit) {
          page++;
          getMyPlaces(deferred);
        } else {
          deferred.resolve(service.myPlacesId);
        }
      }).catch(function (reason) {
        deferred.reject(reason);
      });
      return deferred.promise;
    }

    function saveViews() {
      page = 0;
      service.myPlacesId = [];
      var toSavePlaces = {};
      getMyPlaces().then(function (ids) {
        ids.forEach(function (id) {
          if (service.places.hasOwnProperty(id)) {
            toSavePlaces[id] = service.places[id];
          }
        });
        var jsonEncoded = JSON.stringify(toSavePlaces);
        service.storage.set(keyName, jsonEncoded);
        NstSvcKeyFactory.set(NST_KEY.GENERAL_COMPACT_VIEW, jsonEncoded);
      });
    }

    var service = new CompactViewStorage();
    return service;
  }
})();
