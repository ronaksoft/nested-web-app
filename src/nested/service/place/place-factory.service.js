(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcPlaceFactory', NstSvcPlaceFactory);

  function NstSvcPlaceFactory($q,
                              WS_ERROR, NST_PLACE_ACCESS,
                              AuthService, WsService, NstSvcPlaceStorage, NstSvcMinimalPlaceStorage,
                              NstFactoryQuery, NstFactoryError) {
    function PlaceFactory() {
      this.requests = {
        get: {},
        getMinimal: {},
        remove: {}
      };
    }

    PlaceFactory.prototype ={
      /**
       * Retrieves a place by id and store in the related cache storage
       *
       * @param {String} id
       *
       * @returns {Promise}
       */
      get: function (id) {
        if (!this.requests.get[id]) {
          var query = new NstFactoryQuery(id);

          this.requests.get[id] = $q(function (resolve, reject) {
            var place = NstSvcPlaceStorage.get(this.query.id);
            if (place) {
              resolve(place);
            } else {
              WsService.request('place/get_info', {
                place_id: this.query.id
              }).then(function (placeData) {
                var place = parsePlace(placeData);
                NstSvcPlaceStorage.set(this.query.id, place);
                resolve(place);
              }.bind({
                query: this.query
              })).catch(function(error) {
                // TODO: Handle error by type
                reject(new NstFactoryError(this.query, error.message, error.err_code));
              }.bind({
                query: this.query
              }));
            }
          }.bind({
            query: query
          }));
        }

        return this.requests.get[id];
      },

      /**
       * Retrieves a place by id and store in the related cache storage
       *
       * @param {String} id
       *
       * @returns {Promise}
       */
      getMinimal: function (id) {
        if (!this.requests.getMinimal[id]) {
          var query = new NstFactoryQuery(id);

          this.requests.getMinimal[id] = $q(function (resolve, reject) {
            var place = NstSvcMinimalPlaceStorage.get(this.query.id) || NstSvcPlaceStorage.get(this.query.id);
            if (place) {
              resolve(place);
            } else {
              PlaceFactory.get(this.query.id).then(resolve).catch(reject);
            }
          }.bind({
            query: query
          }));
        }

        return this.requests.getMinimal[id];
      },

      remove: function (id) {
        if (!this.requests.remove[id]) {
          var query = new NstFactoryQuery(id);

          this.requests.remove[id] = $q(function(resolve, reject) {
            if (!AuthService.haveAccess(this.query.id, [NST_PLACE_ACCESS.REMOVE_PLACE])) {
              reject(new NstFactoryError(this.query, 'Access Denied', WS_ERROR.ACCESS_DENIED));
            }

            WsService.request('place/remove', {
              place_id: query.id
            }).then(function () {

            }).catch(function (error) {
              // TODO: Handle error by type
              reject(new NstFactoryError(this.query, error.message, error.err_code));
            }.bind({
              query: this.query
            }));
          }.bind({
            query: query
          }));
        }

        return this.requests.remove[id];
      }
    };

    function parsePlace(placeData) {

    }

    return new PlaceFactory();
  }
})();
