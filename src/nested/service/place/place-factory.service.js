(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcPlaceFactory', NstSvcPlaceFactory);

  function NstSvcPlaceFactory($q,
                              NST_SRV_ERROR, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE,
                              NstSvcAuth, NstSvcServer, NstSvcPlaceStorage, NstSvcMinimalPlaceStorage,
                              NstFactoryQuery, NstFactoryError, NstPlace) {
    function PlaceFactory() {
      this.requests = {
        get: {},
        getMinimal: {},
        remove: {}
      };
    }

    PlaceFactory.prototype = {
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
              NstSvcServer.request('place/get_info', {
                place_id: this.query.id
              }).then(function (placeData) {
                var place = NstSvcPlaceFactory.parsePlace(placeData);
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
            var place = NstSvcPlaceStorage.get(this.query.id) || NstSvcMinimalPlaceStorage.get(this.query.id);
            if (place) {
              resolve(place);
            } else {
              NstSvcPlaceFactory.get(this.query.id).then(function (place) {
                NstSvcMinimalPlaceStorage.set(this.query.id, place);
                resolve(place);
              }.bind({
                query: this.query
              })).catch(reject);
            }
          }.bind({
            query: query
          }));
        }

        return this.requests.getMinimal[id];
      },

      set: function (place) {
        NstSvcPlaceStorage.set(place.getId(), place);
        NstSvcMinimalPlaceStorage.set(place.getId(), place);

        return this;
      },

      save: function (place) {

      },

      remove: function (id) {
        if (!this.requests.remove[id]) {
          var query = new NstFactoryQuery(id);

          this.requests.remove[id] = $q(function(resolve, reject) {
            if (!NstSvcAuth.haveAccess(this.query.id, [NST_PLACE_ACCESS.REMOVE_PLACE])) {
              reject(new NstFactoryError(this.query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
            }

            NstSvcServer.request('place/remove', {
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
      },

      parsePlace: function (placeData) {
        var place = new NstPlace();

        if (!angular.isObject(placeData)) {
          return place;
        }

        place.setId(placeData._id);
        place.setName(placeData.name);
        place.setDescription(placeData.description);

        if (angular.isObject(placeData.picture)) {
          place.setPicture(placeData.picture.org, {
            32: placeData.picture.x32,
            64: placeData.picture.x64,
            128: placeData.picture.x128
          });
        }

        if (placeData.parent_id) {
          var parent = NstSvcMinimalPlaceStorage.get(placeData.parent_id) || NstSvcPlaceStorage.get(placeData.parent_id);
          if (!parent) {
            parent = NstSvcPlaceFactory.parsePlace({
              _id: placeData.parent_id
            });

            // TODO: Push into factory
          }

          place.setParent(parent);
        }

        if (placeData.grand_parent_id) {
          var grandParent = NstSvcMinimalPlaceStorage.get(placeData.grand_parent_id) || NstSvcPlaceStorage.get(placeData.grand_parent_id);
          if (!grandParent) {
            grandParent = NstSvcPlaceFactory.parsePlace({
              _id: placeData.grand_parent_id
            });

            // TODO: Push into factory
          }

          place.setGrandParent(grandParent);
        }

        if (angular.isArray(placeData.childs)) {
          var children = {};
          for (var k in placeData.childs) {
            var child = NstSvcMinimalPlaceStorage.get(placeData.childs[k]._id) || NstSvcPlaceStorage.get(placeData.childs[k]._id);
            if (!child) {
              child = NstSvcPlaceFactory.parsePlace(placeData.childs[k]);
            }

            child.setParent(place);
            child.setGrandParent(place.getGrandPlace());
            // TODO: Push into factory

            children[child.getId()] = child;
          }

          place.setChildren(children);
        }

        if (angular.isObject(placeData.privacy)) {
          place.setPrivacy({
            email: placeData.privacy.email,
            locked: placeData.privacy.locked,
            receptive: placeData.privacy.receptive,
            search: placeData.privacy.search
          });
        }

        // Push Place Access to SvcAuth

        return place;
      },

      addUser: function (place, role, user) {
        if (NST_PLACE_MEMBER_TYPE.indexOf(role) < 0) {
          return $q(function (res, rej) {
            // TODO: Reject with error
            rej();
          });
        }

        return NstSvcServer.request('place/invite_member', {
          place_id: place.getId(),
          member_id: user.getId(),
          role: role
        });
      }
    };

    return new PlaceFactory();
  }
})();
