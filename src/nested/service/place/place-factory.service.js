(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcPlaceFactory', NstSvcPlaceFactory);

  function NstSvcPlaceFactory($q,
                              NST_SRV_ERROR, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE,
                              NstSvcAuth, NstSvcServer, NstSvcPlaceStorage, NstSvcTinyPlaceStorage, NstSvcMyPlaceIdStorage,
                              NstFactoryQuery, NstFactoryError, NstTinyPlace, NstPlace) {
    function PlaceFactory() {
      this.requests = {
        get: {},
        getTiny: {},
        getMine: undefined,
        remove: {}
      };
    }

    PlaceFactory.prototype = {};
    PlaceFactory.prototype.constructor = PlaceFactory;

    PlaceFactory.prototype.has = function (id) {
      return !!NstSvcPlaceStorage.get(id);
    };

    PlaceFactory.prototype.hasTiny = function (id) {
      return !!NstSvcTinyPlaceStorage.get(id);
    };

    /**
     * Retrieves a place by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.get = function (id) {
      var factory = this;

      if (!this.requests.get[id]) {
        var query = new NstFactoryQuery(id);

        // FIXME: Check whether if request should be removed on resolve/reject
        this.requests.get[id] = $q(function (resolve, reject) {
          var place = NstSvcPlaceStorage.get(query.id);
          if (place) {
            resolve(place);
          } else {
            NstSvcServer.request('place/get_info', {
              place_id: query.id
            }).then(function (placeData) {
              var place = factory.parsePlace(placeData.info);
              NstSvcPlaceStorage.set(query.id, place);
              resolve(place);
            }).catch(function(error) {
              // TODO: Handle error by type
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        });
      }

      return this.requests.get[id];
    };

    /**
     * Retrieves a place by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.getTiny = function (id) {
      var factory = this;

      if (!this.requests.getTiny[id]) {
        var query = new NstFactoryQuery(id);

        // FIXME: Check whether if request should be removed on resolve/reject
        this.requests.getTiny[id] = $q(function (resolve, reject) {
          var place = NstSvcPlaceStorage.get(query.id) || NstSvcTinyPlaceStorage.get(query.id);
          if (place) {
            if (!(place instanceof NstTinyPlace)) {
              place = new NstTinyPlace(place);
            }

            resolve(place);
          } else {
            factory.get(query.id).then(function (place) {
              place = new NstTinyPlace(place);
              NstSvcTinyPlaceStorage.set(query.id, place);
              resolve(place);
            }).catch(reject);
          }
        });
      }

      return this.requests.getTiny[id];
    };

    /**
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.getMyPlaces = function () {
      var factory = this;

      function resolveMap(placeIds) {
        var deferred = $q.defer();
        var promises = [];

        for (var k in placeIds) {
          (function (placeId) {
            promises.push(factory.get(placeId.id).then(function (place) {
              var placeClone = angular.copy(place);

              var deferred = $q.defer();

              if (placeId.children.length > 0) {
                resolveMap(placeId.children).then(function (places) {
                  placeClone.setChildren(places);

                  deferred.resolve(placeClone);
                });
              } else {
                deferred.resolve(placeClone);
              }

              return deferred.promise;
            }));
          })(placeIds[k]);
        }

        $q.all(promises).then(function () {
          var places = { length: arguments.length };
          for (var k in arguments) {
            places[arguments[k].getId()] = arguments[k];
          }

          deferred.resolve(places);
        });

        return deferred.promise;
      }

      function createMap(placeData) {
        var place = factory.parsePlace(placeData);

        var map = {
          id: place.getId(),
          children: []
        };

        factory.set(place);

        if (placeData.childs && placeData.childs.length > 0) {
          map.children = placeData.childs.map(createMap);
        }

        return map;
      }

      if (!this.requests.getMine) {
        this.requests.getMine = $q(function (resolve, reject) {
          var placeIds = NstSvcMyPlaceIdStorage.get('all');
          if (placeIds) {
            resolveMap(placeIds).then(resolve);
          } else {
            NstSvcServer.request('account/get_my_places', { detail: 'full' }).then(function (data) {
              var placeIds = data.places.map(createMap);
              NstSvcMyPlaceIdStorage.set('all', placeIds);
              resolveMap(placeIds).then(resolve);
            });
          }
        });
      }

      return this.requests.getMine;
    };

    /**
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.getMyTinyPlaces = function () {
      var factory = this;

      function resolveMap(placeIds) {
        var deferred = $q.defer();
        var promises = [];

        for (var k in placeIds) {
          (function (placeId) {
            promises.push(factory.getTiny(placeId.id).then(function (place) {
              var placeClone = angular.copy(place);

              var deferred = $q.defer();

              if (placeId.children.length > 0) {
                resolveMap(placeId.children).then(function (places) {
                  placeClone.setChildren(places);

                  deferred.resolve(placeClone);
                });
              } else {
                deferred.resolve(placeClone);
              }

              return deferred.promise;
            }));
          })(placeIds[k]);
        }

        $q.all(promises).then(function (promises) {
          var places = { length: promises.length };
          for (var k in promises) {
            places[promises[k].getId()] = promises[k];
          }

          deferred.resolve(places);
        });

        return deferred.promise;
      }

      function createMap(placeData) {
        var place = factory.parseTinyPlace(placeData);

        var map = {
          id: place.getId(),
          children: []
        };

        factory.set(place);

        if (placeData.childs && placeData.childs.length > 0) {
          map.children = placeData.childs.map(createMap);
        }

        return map;
      }

      if (!this.requests.getMine) {
        this.requests.getMine = $q(function (resolve, reject) {
          var placeIds = NstSvcMyPlaceIdStorage.get('tiny');
          if (placeIds) {
            resolveMap(placeIds).then(resolve);
          } else {
            NstSvcServer.request('account/get_my_places').then(function (data) {
              var placeIds = data.places.map(createMap);
              NstSvcMyPlaceIdStorage.set('tiny', placeIds);
              resolveMap(placeIds).then(resolve);
            });
          }
        });
      }

      return this.requests.getMine;
    };

    PlaceFactory.prototype.set = function (place) {
      if (place instanceof NstPlace) {
        if (this.has(place.getId())) {
          NstSvcPlaceStorage.merge(place.getId(), place);
        } else {
          NstSvcPlaceStorage.set(place.getId(), place);
        }
      } else if (place instanceof NstTinyPlace) {
        if (this.hasTiny(place.getId())) {
          NstSvcTinyPlaceStorage.merge(place.getId(), place);
        } else {
          NstSvcTinyPlaceStorage.set(place.getId(), place);
        }
      }

      return this;
    };

    PlaceFactory.prototype.save = function (place) {
      var factory = this;

      if (place.isNew()) {
        var params = {
          place_id: place.getId(),
          place_name: place.getName(),
          place_desc: place.getDescription(),
          place_pic: place.getPicture().getOrg().getId(),
          // 'privacy.broadcast': place.getPrivacy().getBroadcast(),
          'privacy.locked': place.getPrivacy().getLocked(),
          'privacy.receptive': place.getPrivacy().getReceptive(),
          'privacy.email': place.getPrivacy().getEmail(),
          'privacy.search': place.getPrivacy().getSearch()
        };

        if (place.parent) {
          params.parent_id = place.parent.getId();
          params.place_id = params.place_id.substr(params.parent_id.length);
        }

        var query = new NstFactoryQuery(place.getId(), params);

        return NstSvcServer.request('place/add', params).then(function (data) {
          var newPlace = factory.parsePlace(data.place);

          return $q(function (res) {
            res(NstSvcPlaceFactory.set(newPlace).get(newPlace.getId()).save());
          });
        }).catch(function (error) {
          // TODO: Handle error by type

          return $q(function (res, reject) {
            reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });
      } else {
        var params = {
          place_id: place.getId(),
          place_name: place.getName(),
          place_desc: place.getDescription(),
          place_pic: place.getPicture().getOrg().getId(),
          // 'privacy.broadcast': place.getPrivacy().getBroadcast(),
          'privacy.locked': place.getPrivacy().getLocked(),
          'privacy.receptive': place.getPrivacy().getReceptive(),
          'privacy.email': place.getPrivacy().getEmail(),
          'privacy.search': place.getPrivacy().getSearch()
        };

        var query = new NstFactoryQuery(place.getId(), params);

        return NstSvcServer.request('place/update', params).then(function () {
          return $q(function (res) {
            res(NstSvcPlaceFactory.set().get(place.getId()).save());
          });
        }).catch(function (error) {
          // TODO: Handle error by type

          return $q(function (res, reject) {
            reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });
      }
    };

    PlaceFactory.prototype.remove = function (id) {
      if (!this.requests.remove[id]) {
        var query = new NstFactoryQuery(id);

        this.requests.remove[id] = $q(function(resolve, reject) {
          if (!NstSvcAuth.haveAccess(query.id, [NST_PLACE_ACCESS.REMOVE_PLACE])) {
            reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
          }

          NstSvcServer.request('place/remove', {
            place_id: query.id
          }).then(function () {
            NstSvcPlaceStorage.remove(query.id);
            NstSvcTinyPlaceStorage.remove(query.id);
          }).catch(function (error) {
            // TODO: Handle error by type
            reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });
      }

      return this.requests.remove[id];
    };

    PlaceFactory.prototype.parseTinyPlace = function (placeData) {
      var place = new NstTinyPlace();

      if (!angular.isObject(placeData)) {
        return place;
      }

      place.setNew(false);
      place.setId(placeData._id);
      place.setName(placeData.name);

      if (angular.isObject(placeData.picture)) {
        place.setPicture(placeData.picture);
      }

      if (placeData.parent_id) {
        var parent = NstSvcTinyPlaceStorage.get(placeData.parent_id) || NstSvcPlaceStorage.get(placeData.parent_id);
        if (!parent) {
          parent = this.parseTinyPlace({
            _id: placeData.parent_id
          });

          // TODO: Push into factory
        }

        place.setParent(parent);
      }

      if (placeData.grand_parent_id) {
        var grandParent = NstSvcTinyPlaceStorage.get(placeData.grand_parent_id) || NstSvcPlaceStorage.get(placeData.grand_parent_id);
        if (!grandParent) {
          grandParent = this.parseTinyPlace({
            _id: placeData.grand_parent_id
          });

          // TODO: Push into factory
        }

        place.setGrandParent(grandParent);
      }

      if (angular.isArray(placeData.childs)) {
        var children = { length: 0 };
        for (var k in placeData.childs) {
          var child = NstSvcTinyPlaceStorage.get(placeData.childs[k]._id) || NstSvcPlaceStorage.get(placeData.childs[k]._id);
          if (!child) {
            child = this.parseTinyPlace(placeData.childs[k]);
          }

          child.setParent(place);
          child.setGrandParent(place.getGrandParent());
          // TODO: Push into factory

          children[child.getId()] = child;
          children.length++;
        }

        place.setChildren(children);
      }

      return place;
    };

    PlaceFactory.prototype.parsePlace = function (placeData) {
      var place = new NstPlace();

      if (!angular.isObject(placeData)) {
        return place;
      }

      place.setNew(false);
      place.setId(placeData._id);
      place.setName(placeData.name);
      place.setDescription(placeData.description);

      if (angular.isObject(placeData.picture)) {
        place.setPicture(placeData.picture);
      }

      if (placeData.parent_id) {
        var parent = NstSvcPlaceStorage.get(placeData.parent_id) || NstSvcTinyPlaceStorage.get(placeData.parent_id);
        if (!parent) {
          parent = this.parseTinyPlace({
            _id: placeData.parent_id
          });

          // TODO: Push into factory
        }

        place.setParent(parent);
      }

      if (placeData.grand_parent_id) {
        var grandParent = NstSvcPlaceStorage.get(placeData.grand_parent_id) || NstSvcTinyPlaceStorage.get(placeData.grand_parent_id);
        if (!grandParent) {
          grandParent = this.parseTinyPlace({
            _id: placeData.grand_parent_id
          });

          // TODO: Push into factory
        }

        place.setGrandParent(grandParent);
      }

      if (angular.isArray(placeData.childs)) {
        var children = { length: 0 };
        for (var k in placeData.childs) {
          var child = NstSvcPlaceStorage.get(placeData.childs[k]._id) || NstSvcTinyPlaceStorage.get(placeData.childs[k]._id);
          if (!child) {
            child = this.parsePlace(placeData.childs[k]);
          }

          child.setParent(place);
          child.setGrandParent(place.getGrandParent());
          // TODO: Push into factory

          children[child.getId()] = child;
          children.length++;
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
    };

    PlaceFactory.prototype.addUser = function (place, role, user) {
      if (NST_PLACE_MEMBER_TYPE.indexOf(role) < 0) {
        return $q(function (res, reject) {
          // TODO: Reject with error
          reject();
        });
      }

      return NstSvcServer.request('place/invite_member', {
        place_id: place.getId(),
        member_id: user.getId(),
        role: role
      });
    };

    return new PlaceFactory();
  }
})();
