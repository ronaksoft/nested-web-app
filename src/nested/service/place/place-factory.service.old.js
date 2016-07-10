(function() {
  'use strict';

  angular
    .module('nested')
    .factory('Deprecated-FactoryQuery', FactoryQuery)
    .service('Deprecated-NstSvcPlaceFactory', NstSvcPlaceFactory);

  function FactoryQuery($q) {
    function FactoryQuery(identifier, data, fields) {
      this.identifier = identifier;
      this.fields = fields;
      this.data = data;
      this.promise = $q(function () {});
    }

    FactoryQuery.prototype = {
      set: function (k, v) {
        if (this.hasOwnProperty(k)) {
          this[k] = v;
        }

        return this;
      },

      get: function (k) {
        return this.hasOwnProperty(k) ? this[k] : undefined;
      },

      set promise(promise) {
        if (!(promise instanceof Promise)) {
          throw 'promise have to be instance of Promise';
        }

        return this.set('promise', promise);
      }
    };

    return FactoryQuery;
  }

  function NstSvcPlaceFactory($q,
                              STORAGE_TYPE,
                              StorageFactoryService, WsService,
                              FactoryQuery, NstPlace) {
    function NestedPlaceFactory() {
      this.cache = StorageFactoryService.create('nested.place.factory.service', STORAGE_TYPE.MEMORY);
      this.cache.setFetchFunction(function (id) {
        // TODO: Return the object
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

        var query = new FactoryQuery(id, angular.isObject(placeData) ? placeData : {}, reqFields);

        if (!id) {
          // Resolve with a new place
          return $q(function (res) { res(new NestedPlace(this.query.data), this.query.data); }.bind({ query: query }));
        }

        return (this.cache.get(id, false).then(function (place) {
          // Exists in cache
          return $q(function (res) {
            res(this.object, this.query.data);
          }.bind({
            object: place,
            query: this.query
          }));
        }.bind({ query: query })).catch(function (id) {
          // Does not exist in cache
          var data = angular.isObject(this.query.data) ? angular.copy(this.query.data) : undefined;
          if (data) {
            data['id'] && delete data['id'];
            data['_id'] && delete data['_id'];
          }

          return NestedPlaceFactory.get(data).then(function (place, data) {
            // place is blank NestedPlace filled by data
            // TODO: Check whether if setData is returning Promise or not: To nest the returning $q in resolving of that
            // It'll push itself onto factory
            place.setData({ id: this.query.identifier });

            return $q(function (res) {
              res(this.object, this.query.data);
            }.bind({
              object: place,
              query: this.query
            }));
          }.bind({ query: this.query }));
        }.bind({ query: query }))).then(function (place, data) {
          // It'll push itself onto factory
          place.setData(data);

          // Check if data is enough
          for (var k in this.query.fields) {
            if (undefined === place.get(this.query.fields[k])) {
              return $q(function (res, rej) {
                rej(this.object, this.query);
              }.bind({ object: place, query: this.query }));
            }
          }

          return $q(function (res) {
            res(this.object);
          }.bind({ object: place }));
        }.bind({ query: query })).catch(function (place, query) {
          // Force to request
          return this.cache.get(place.id, true).then(function (data) {
            // TODO: Check whether if setData is returning Promise or not: To nest the returning $q in resolving of that
            this.object.setData(data);

            // TODO: Check if place is having required fields
            return $q(function (res) {
              res(this.object);
            }.bind({ object: this.object }));
          }.bind({ object: place, query: query })).catch(function (error) {
            switch (error.err_code) {
              case WS_ERROR.TIMEOUT:
                return NestedPlaceFactory.get(this.object, this.query.fields);
                break;

              default:
                return $q(function (res, rej) {
                  rej(this.error, this.object.id);
                }.bind({ object: this.object, error: error }));
                break;
            }
          }.bind({ object: place, query: query }));
        }.bind(this));
      }
    };

    return new NestedPlaceFactory();
  }
})();
