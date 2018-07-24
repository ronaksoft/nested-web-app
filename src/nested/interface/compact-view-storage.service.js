(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcCompactViewStorage', NstSvcCompactViewStorage);

  /** @ngInject */
  function NstSvcCompactViewStorage(NST_STORAGE_TYPE, NstStorage, NstSvcServer, $q, NstSvcKeyFactory, NST_KEY) {

    var keyName = 'compactView';

    function CompactViewStorage() {
      this.places = {};
      this.myPlacesId = [];
      this.storage = new NstStorage(NST_STORAGE_TYPE.LOCAL, 'view');
      var jsonEncoded = this.storage.get(keyName);
      if (jsonEncoded) {
        this.places = jsonEncoded;
      }
      NstSvcKeyFactory.get(NST_KEY.GENERAL_COMPACT_VIEW).then(function (data) {
        if (data) {
          data = JSON.parse(data);
          service.places = data;
          service.storage.set(keyName, data);
        }
      });
      getMyPlaces();
    }

    CompactViewStorage.prototype.constructor = CompactViewStorage;

    CompactViewStorage.prototype.setByPlace = setByPlace;
    CompactViewStorage.prototype.getByPlace = getByPlace;


    function setByPlace(placeId, isCompact) {
      saveViews(placeId, isCompact);
    }

    function getByPlace(placeId) {
      return service.places[placeId] || false;
    }

    function getAllPlaces() {
      return NstSvcServer.request('account/get_all_places', {
        with_children: true
      });
    }

    function getMyPlaces() {
      var deferred = $q.defer();
      getAllPlaces().then(function (res) {
        res.places.forEach(function (place) {
          service.myPlacesId.push(place._id);
        });
        deferred.resolve(service.myPlacesId);
      }).catch(function (reason) {
        deferred.reject(reason);
      });
      return deferred.promise;
    }

    function saveViews(placeId, isCompact) {
      var toSavePlaces = {};
      NstSvcKeyFactory.get(NST_KEY.GENERAL_COMPACT_VIEW).then(function (data) {
        if (data) {
          data = JSON.parse(data);
          service.places = data;
          service.places[placeId] = isCompact;
          service.myPlacesId.forEach(function (id) {
            if (service.places.hasOwnProperty(id)) {
              toSavePlaces[id] = service.places[id];
            }
          });
          ['__feed__', '__bookmark__', '__place_message__', '__sent__', '__unread__', '__personal__'].forEach(function(key) {
            if (service.places.hasOwnProperty(key)) {
              toSavePlaces[key] = service.places[key];
            }
          });
          var jsonEncoded = JSON.stringify(toSavePlaces);
          service.storage.set(keyName, toSavePlaces);
          NstSvcKeyFactory.set(NST_KEY.GENERAL_COMPACT_VIEW, jsonEncoded);
        }
      });
    }

    var service = new CompactViewStorage();
    return service;
  }
})();
