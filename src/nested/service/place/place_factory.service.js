/**
 * Created by pouyan on 6/19/16.
 */
(function() {
  'use strict';

  angular
    .module('nested')
    .service('NestedPlaceFactoryService', NestedPlaceFactoryService);

  function NestedPlaceFactoryService($q,
                                     CACHE_STORAGE,
                                     CacherFactoryService, WsService,
                                     NestedPlace) {
    function NestedPlaceFactory() {
      this.cache = CacherFactoryService.create('nested.place.factory.service', CACHE_STORAGE.MEMORY);
      this.cache.setFetchFunction(function (id) {
        return WsService.request('place/get_info', { place_id: id });
      });
    }

    NestedPlaceFactory.prototype = {
      /**
       *
       * @param {string|object|undefined} placeData Place identifier/data which is wanted
       * @param {string[]|undefined}      reqFields Place's expected fields
       *
       * @return {Promise}
       */
      get: function (placeData, reqFields) {
        var id = (angular.isString(placeData) && placeData) ||
          (angular.isObject(placeData) && (placeData['id'] || placeData['_id'])) ||
          undefined;

        if (!id) {
          // Resolve with a new place
          return $q(function (res) { res(new NestedPlace(this.data), this.data); }.bind({ data: placeData }));
        }

        return (this.cache.get(id, false).then(function (place) {
          return $q(function (res) {
            res(this.object, this.placeData);
          }.bind({
            object: place,
            placeData: this.data
          }));
        }.bind({ data: placeData })).catch(function (id) {
          var data = angular.isObject(this.data) ? angular.copy(this.data) : undefined;
          if (data) {
            data['id'] && delete data['id'];
            data['_id'] && delete data['_id'];
          }

          return NestedPlaceFactory.get(data).then(function (place, data) {
            // TODO: Check whether if setData is returning Promise or not: To nest the returning $q in resolving of that
            place.setData({ id: this.id });

            return $q(function (res) {
              res(this.object, this.placeData);
            }.bind({
              object: place,
              placeData: data
            }));
          }.bind({
            id: id
          }));
        }.bind({ data: placeData }))).then(function (place, data) {
          // TODO: Load data into place
          // TODO: Check if data is enough
        }.bind({ data: placeData }));
      }
    };

    return new NestedPlaceFactory();
  }
})();
