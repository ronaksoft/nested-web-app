(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceFactory', NstSvcPlaceFactory);

  function NstSvcPlaceFactory($q, $log,
                              NST_SRV_ERROR, NST_SRV_EVENT, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_EVENT_ACTION, NST_PLACE_FACTORY_EVENT, NST_PLACE_POLICY,
                              NstSvcServer, NstSvcPlaceStorage, NstSvcTinyPlaceStorage, NstSvcMyPlaceIdStorage, NstSvcUserFactory, NstSvcPlaceRoleStorage, NstSvcPlaceAccessStorage,
                              NstObservableObject, NstFactoryQuery, NstFactoryError, NstUtility, NstTinyPlace, NstPlace, NstFactoryEventData,
                              NstPlaceCreatorOfParentError, NstPlaceOneCreatorLeftError) {
    function PlaceFactory() {
      var factory = this;

      this.requests = {
        get: {},
        getTiny: {},
        getMine: undefined,
        getMyTiny: undefined,
        getAccess: {},
        getRole: {},
        getMembers: {},
        getNotif: {},
        isMine: {},
        addMember: {},
        setNotification: {},
        getBookmark: {},
        setBookmark: {},
        setPicture: {},
        removeMember: {},
        remove: {}
      };

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (event) {
        var tlData = event.detail.timeline_data;

        // TODO: Do I have to handle member_add/member_remove too?

        switch (tlData.action) {
          case NST_EVENT_ACTION.PLACE_ADD:
            var isGrandPlace = tlData.place_id && !tlData.child_id;
            var isSubPlace = tlData.place_id && tlData.child_id;

            if (isGrandPlace) {
              factory.getTiny(tlData.place_id).then(function (place) {
                factory.dispatchEvent(new CustomEvent(
                  NST_PLACE_FACTORY_EVENT.ROOT_ADD,
                  { detail: { id: place.getId(), place: place } }
                ));
              });
            } else if (isSubPlace) {
              $q.all([factory.getTiny(tlData.place_id), factory.getTiny(tlData.child_id)]).then(function (resolvedSet) {
                var parentPlace = resolvedSet[0];
                var place = resolvedSet[1];
                factory.dispatchEvent(new CustomEvent(
                  NST_PLACE_FACTORY_EVENT.SUB_ADD,
                  { detail: { id: place.getId(), place: place, parentPlace: parentPlace } }
                ));
              });
            }
            break;

          case NST_EVENT_ACTION.PLACE_REMOVE:
            factory.getTiny(tlData.place_id).then(function (parentPlace) {
              factory.dispatchEvent(new CustomEvent(
                NST_PLACE_FACTORY_EVENT.REMOVE,
                { detail: { id: tlData.child_id, parentPlace: parentPlace } }
              ));
            });
            break;

          case NST_EVENT_ACTION.PLACE_PRIVACY:
            this.get(tlData.place_id).then(function (place) {
              factory.dispatchEvent(new CustomEvent(
                NST_PLACE_FACTORY_EVENT.PRIVACY_CHANGED,
                { detail: { id: place.getId(), place: place } }
              ));
            });
            break;

          case NST_EVENT_ACTION.PLACE_PICTURE:
            this.getTiny(tlData.place_id).then(function (place) {
              factory.dispatchEvent(new CustomEvent(
                NST_PLACE_FACTORY_EVENT.PICTURE_CHANGE,
                { detail: { id: place.getId(), place: place } }
              ));
            });
            break;
        }
      });
    }

    PlaceFactory.prototype = new NstObservableObject();

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
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        });
      }

      return this.requests.get[id].then(function () {
        var args = arguments;
        delete factory.requests.get[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.get[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
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

      return this.requests.getTiny[id].then(function () {
        var args = arguments;
        delete factory.requests.getTiny[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.getTiny[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
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
        var query = new NstFactoryQuery();

        this.requests.getMine = $q(function (resolve, reject) {
          var placeIds = NstSvcMyPlaceIdStorage.get('all');
          if (placeIds) {
            resolveMap(placeIds).then(resolve);
          } else {
            NstSvcServer.request('account/get_my_places', { detail: 'full' }).then(function (data) {
              var placeIds = data.places.map(createMap);
              NstSvcMyPlaceIdStorage.set('all', placeIds);
              resolveMap(placeIds).then(resolve);
            }).catch(function (error) {
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        });
      }

      return this.requests.getMine.then(function () {
        var args = arguments;
        factory.requests.getMine = undefined;

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        factory.requests.getMine = undefined;

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
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

      if (!this.requests.getMyTiny) {
        var query = new NstFactoryQuery();

        this.requests.getMyTiny = $q(function (resolve, reject) {
          var placeIds = NstSvcMyPlaceIdStorage.get('tiny');
          if (placeIds) {
            resolveMap(placeIds).then(resolve);
          } else {
            NstSvcServer.request('account/get_my_places').then(function (data) {
              var placeIds = data.places.map(createMap);
              NstSvcMyPlaceIdStorage.set('tiny', placeIds);
              resolveMap(placeIds).then(resolve);
            }).catch(function (error) {
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        });
      }

      return this.requests.getMyTiny.then(function () {
        var args = arguments;
        factory.requests.getMyTiny = undefined;

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        factory.requests.getMyTiny = undefined;

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.addToMyPlaceIds = function (id) {
      var factory = this;

      var fullPlaceIds = NstSvcMyPlaceIdStorage.get('all');
      if (fullPlaceIds) {
        fullPlaceIds.push(id);
        NstSvcMyPlaceIdStorage.set('all', fullPlaceIds);
      }

      var tinyPlaceIds = NstSvcMyPlaceIdStorage.get('tiny');
      if (tinyPlaceIds) {
        tinyPlaceIds.push(id);
        NstSvcMyPlaceIdStorage.set('tiny', tinyPlaceIds);
      }

      var deferred = $q.defer();
      this.getTiny(id).then(function (place) {
        factory.dispatchEvent(new CustomEvent(
          NST_PLACE_FACTORY_EVENT.ROOT_ADD,
          { detail: { id: id, place: place } }
        ));

        deferred.resolve(place);
      }).catch(deferred.reject);

      return deferred.promise;
    };

    PlaceFactory.prototype.isInMyPlaces = function (id) {
      var factory = this;

      if (!this.requests.isMine[id]) {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        this.getMyTinyPlaces().then(function (myTinyPlaces) {
          // TODO: Implement this check
        }).catch(deferred.reject);

        this.requests.isMine[id] = deferred.promise;
      }

      return this.requests.isMine[id].then(function () {
        var args = arguments;
        delete factory.requests.isMine[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.isMine[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.save = function (place) {
      var factory = this;
      if (place.isNew()) {
        var deferred = $q.defer();

        var params = {
          place_id: place.getId(),
          place_name: place.getName(),
          // place_desc: place.getDescription(),
          // place_pic: place.getPicture().getOrg().getId(),
          // 'privacy.locked': place.getPrivacy().getLocked(),
          // 'privacy.receptive': place.getPrivacy().getReceptive(),
          // 'privacy.email': place.getPrivacy().getEmail(),
          // 'privacy.search': place.getPrivacy().getSearch()
        };

        if (place.getParent() && place.getParent().getId()) {
          params.parent_id = place.getParent().getId();
          params.place_id = params.place_id.substr(params.parent_id.length);
        }

        var query = new NstFactoryQuery(place.getId(), params);

        NstSvcServer.request('place/add', params).then(function (data) {
          var newPlace = factory.parsePlace(data.place);

          return $q(function (res) {
            res(newPlace);
          });
        }).then(function (newPlace) {
          newPlace.save();
          factory.set(newPlace);

          var deferred = $q.defer();

          newPlace.setDescription(place.getDescription());
          newPlace.setPrivacy(place.getPrivacy());
          newPlace.setPolicy(place.getPolicy());
          var promises = [
            factory.save(newPlace)
          ];

          // TODO: Move this to update
          if (place.getPicture().getOrg().getId()) {
            promises.push(factory.updatePicture(newPlace.getId(), place.getPicture().getOrg().getId()));
          }

          $q.all(promises).then(function (resolveds) {
            var newPlace = resolveds[0];
            deferred.resolve(newPlace);
          }).catch(deferred.reject);

          return deferred.promise;
        }).then(function (newPlace) {
          // TODO: Is the model able to save itself? The answer is NO! the below line is not required it think.
          newPlace.save();
          factory.set(newPlace);

          if (params.parent_id) {
            // Subplace Added
            factory.getTiny(params.parent_id).then(function (parentPlace) {

              parentPlace.children[newPlace.id] = newPlace;
              parentPlace.children.length++;

              var myPlaces = NstSvcMyPlaceIdStorage.get('tiny');
              factory.addPlaceToTree(myPlaces, { id : newPlace.id, children : [] });
              NstSvcMyPlaceIdStorage.set('tiny', myPlaces);

              factory.dispatchEvent(new CustomEvent(
                NST_PLACE_FACTORY_EVENT.SUB_ADD,
                { detail: { id: newPlace.getId(), place: newPlace, parentPlace: parentPlace } }
              ));
            });
          } else {
            // Grand Place Added
            factory.dispatchEvent(new CustomEvent(
              NST_PLACE_FACTORY_EVENT.ROOT_ADD,
              { detail: { id: newPlace.getId(), place: newPlace } }
            ));
          }

          deferred.resolve(newPlace);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      } else {
        var params = {
          place_id: place.getId(),
          place_name: place.getName(),
          place_desc: place.getDescription(),
          // place_pic: place.getPicture().getOrg().getId(),
          'privacy.locked': place.getPrivacy().getLocked(),
          'privacy.receptive': place.getPrivacy().getReceptive(),
          // 'privacy.email': place.getPrivacy().getEmail(),
          'privacy.search': place.getPrivacy().getSearch(),
          'policy.add_member' : place.getPolicy().getAddMember(),
          'policy.add_place' : place.getPolicy().getAddPlace(),
        };

        var query = new NstFactoryQuery(place.getId(), params);

        return NstSvcServer.request('place/update', params).catch(function (error) {
          return $q(function (res, reject) {
            reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }).then(function () {
          factory.set(place);

          factory.dispatchEvent(new CustomEvent(
            NST_PLACE_FACTORY_EVENT.UPDATE,
            { detail: { id: place.getId(), place: place } }
          ));

          return factory.get(place.getId());
        });
      }
    };

    PlaceFactory.prototype.updatePicture = function (id, uid) {
      var factory = this;

      if (!this.requests.setPicture[id]) {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id, { uid: uid });

        this.hasAccess(query.id, [NST_PLACE_ACCESS.CONTROL]).then(function (has) {
          if (!has) {
            deferred.reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
          }

          NstSvcServer.request('place/set_picture', {
            place_id: id,
            universal_id: uid
          }).then(function (response) {
            deferred.resolve(response);
          }).catch(function (error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }).catch(function () {
          deferred.reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
        });

        this.requests.setPicture[id] = deferred.promise;
      }

      return this.requests.setPicture[id].then(function () {
        var args = arguments;
        delete factory.requests.setPicture[id];

        factory.getTiny(id).then(function (place) {
          factory.dispatchEvent(new CustomEvent(
            NST_PLACE_FACTORY_EVENT.PICTURE_CHANGE,
            { detail: { id: place.getId(), place: place } }
          ));
        });

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.setPicture[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.remove = function (id) {
      var factory = this;

      if (!this.requests.remove[id]) {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        this.hasAccess(query.id, [NST_PLACE_ACCESS.REMOVE_PLACE]).then(function (has) {
          if (!has) {
            deferred.reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
          }

          factory.get(id).then(function (place) {
            NstSvcServer.request('place/remove', {
              place_id: query.id
            }).then(function () {
              // clean up storages
              NstSvcPlaceStorage.remove(query.id);
              NstSvcTinyPlaceStorage.remove(query.id);
              var myPlaces = NstSvcMyPlaceIdStorage.get('tiny');
              factory.removePlaceFromTree(myPlaces, id);
              NstSvcMyPlaceIdStorage.set('tiny', myPlaces);

              factory.dispatchEvent(new CustomEvent(NST_PLACE_FACTORY_EVENT.REMOVE, new NstFactoryEventData(id)));

              deferred.resolve(place);
            }).catch(function (error) {
              deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }).catch(function (error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });

        this.requests.remove[id] = deferred.promise;
      }

      return this.requests.remove[id].then(function () {
        var args = arguments;
        delete factory.requests.remove[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.remove[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.getNotificationOption = function (id) {
      var factory = this;

      if (!this.requests.getNotif[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('notification/get_place_notification', {
          place_id: id
        }).then(function (data) {
          defer.resolve(data.state);
        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        this.requests.getNotif[id] = defer.promise;
      }

      return this.requests.getNotif[id].then(function () {
        var args = arguments;
        delete factory.requests.getNotif[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.getNotif[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.setNotificationOption = function (id, value) {
      var factory = this;

      if (!this.requests.setNotification[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('notification/set_place_notification', {
          place_id: id,
          state: !!value
        }).then(function () {
          defer.resolve(true);
        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        this.requests.setNotification[id] = defer.promise;
      }

      return this.requests.setNotification[id].then(function () {
        var args = arguments;
        delete factory.requests.setNotification[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.setNotification[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.getBookmarkedPlaces = function (bookmarkId) {
      var factory = this;
      var defer = $q.defer();
      var query = new NstFactoryQuery(bookmarkId);

      NstSvcServer.request('bookmark/get_places', {
        bookmark_id: bookmarkId
      }).then(function (data) {
        defer.resolve(data.places);
      }).catch(function (error) {
        defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return defer.promise.then(function () {
        var args = arguments;

        return $q(function (res) {
          res.apply(null, args);
        });

      });

    };

    PlaceFactory.prototype.getBookmarkOption = function (id, bookmarkId) {
      var factory = this;

      if (!this.requests.getBookmark[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('bookmark/exists', {
          place_id: id,
          bookmark_id : bookmarkId
        }).then(function (data) {
          defer.resolve(data.exists);
        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        this.requests.getBookmark[id] = defer.promise;
      }

      return this.requests.getBookmark[id].then(function () {
        var args = arguments;
        delete factory.requests.getNotif[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.getNotif[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.setBookmarkOption = function (id, bookmarkId, value) {
      var factory = this;
      var requestCommad;
      value ? requestCommad = 'bookmark/add_place' : requestCommad = 'bookmark/remove_place'

      if (!this.requests.setBookmark[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request(requestCommad, {
          place_id: id,
          bookmark_id: bookmarkId,
        }).then(function () {
          defer.resolve(true);
        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        this.requests.setBookmark[id] = defer.promise;
      }

      return this.requests.setBookmark[id].then(function () {
        var args = arguments;
        delete factory.requests.setBookmark[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.setBookmark[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.search = function (keyword) {
      var factory = this;
      var deferred = $q.defer();
      var query = new NstFactoryQuery(keyword);

      NstSvcServer.request('place/search', { keyword: keyword }).then(function (response) {
        var places = [];
        for (var k in response.places) {
          var place = factory.parseTinyPlace(response.places[k]);
          factory.set(place);
          places.push(place);
        }

        deferred.resolve(places);
      }).catch(function(error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    };

    PlaceFactory.prototype.addUser = function (place, role, user) {
      var factory = this;
      var id = place.getId() + '-' + user.getId() + '-' + role;

      if (!this.requests.addMember[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('place/invite_member', {
          place_id: place.getId(),
          member_id: user.getId(),
          role: role
        }).then(function (result) {
          defer.resolve(result.invite_id.$oid);
        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          $log.debug(error);
        });

        this.requests.addMember[id] = defer.promise;
      }

      return this.requests.addMember[id].then(function () {
        var args = arguments;
        delete factory.requests.addMember[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.addMember[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.removeMember = function (id, memberId, currentUser) {
      var factory = this;

      if (!this.requests.removeMember[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('place/remove_member', {
          place_id: id,
          member_id: memberId
        }).then(function (result) {
          if (currentUser) { // current user wants to leave the place
            factory.dispatchEvent(new CustomEvent(NST_PLACE_FACTORY_EVENT.REMOVE, new NstFactoryEventData(id)));
            $log.debug(NstUtility.string.format('User "{0}" leaved place "{1}".', memberId, id));
          } else {
            $log.debug(NstUtility.string.format('User "{0}" was removed from place "{1}".', memberId, id));
          }
          defer.resolve();
          $log.debug('Place Factory | Member Remove Response: ', result);
        }).catch(function (error) {
          if (error.getCode() === NST_SRV_ERROR.ACCESS_DENIED) {
            if (error.previous.items[0] === 'only_one_creator') {
              defer.reject(new NstPlaceOneCreatorLeftError(error));
            } else if (error.previous.items[0] === 'parent_creator') {
              defer.reject(new NstPlaceCreatorOfParentError(error));
            }

          } else {
            defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          }
          $log.debug('Place Factory | Member Remove Error: ', error);
        });

        this.requests.removeMember[id] = defer.promise;
      }

      return this.requests.removeMember[id].then(function () {
        var args = arguments;
        delete factory.requests.removeMember[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.removeMember[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.getMembers = function (id) {
      var factory = this;

      if (!this.requests.getMembers[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('place/get_members', {
          place_id: id
        }).then(function (data) {
          defer.resolve({
            creators : _.map(data.creators, NstSvcUserFactory.parseTinyUser),
            keyHolders : _.map(data.key_holders, NstSvcUserFactory.parseTinyUser),
            knownGuests : _.map(data.known_guests, NstSvcUserFactory.parseTinyUser),
          });

          $log.debug('Place Factory | Member Retrieve Response: ', data);
        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          $log.debug('Place Factory | Member Retrieve Error: ', error);
        });

        this.requests.getMembers[id] = defer.promise;
      }

      return this.requests.getMembers[id].then(function () {
        var args = arguments;
        delete factory.requests.getMembers[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.getMembers[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.getRoleOnPlace = function (id, forceRequest) {
      var factory = this;

      if (!this.requests.getRole[id]) {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        var placeRole = NstSvcPlaceRoleStorage.get(id);
        if (placeRole && !forceRequest) {
          deferred.resolve(placeRole);
        } else {
          this.get(id).then(function () {
            placeRole = NstSvcPlaceRoleStorage.get(id);
            if (placeRole) {
              deferred.resolve(placeRole);
            } else {
              deferred.reject(new NstFactoryError(query, 'Unknown Error in Retrieving Place Role', NST_SRV_ERROR.UNKNOWN));
            }
          }).catch(deferred.reject);
        }

        this.requests.getRole[id] = deferred.promise;
      }

      return this.requests.getRole[id].then(function () {
        var args = arguments;
        delete factory.requests.getRole[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.getRole[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.setRoleOnPlace = function(placeId, role) {
      if (role) {
        NstSvcPlaceRoleStorage.set(placeId, role);
      }
    };

    PlaceFactory.prototype.getAccessOnPlace = function(id, forceRequest) {
      var factory = this;

      if (!this.requests.getAccess[id]) {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        var placeAccess = NstSvcPlaceAccessStorage.get(id);
        if (placeAccess && !forceRequest) {
          deferred.resolve(placeAccess);
        } else {
          NstSvcServer.request('place/get_access', { place_ids: id }).then(function (response) {
            var access = [];
            if (response.places.length) {
              if (response.places.length > 1) {
                access = {};
                for (var k in response.places) {
                  var placeData = response.places[k];
                  var placeId = placeData._id;
                  access[placeId] = placeData.access;
                  factory.setAccessOnPlace(placeId, access[placeId]);
                }
              } else {
                var placeData = response.places[0];
                access = placeData.access;
                factory.setAccessOnPlace(id, placeData.access);
              }
            }

            if (access) {
              deferred.resolve(access);
            } else {
              deferred.reject(new NstFactoryError(query, 'Unknown Error in Retrieving Place Role', NST_SRV_ERROR.UNKNOWN));
            }
          }).catch(function (error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }

        this.requests.getAccess[id] = deferred.promise;
      }

      return this.requests.getAccess[id].then(function () {
        var args = arguments;
        delete factory.requests.getAccess[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.getAccess[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    PlaceFactory.prototype.setAccessOnPlace = function(placeId, access) {
      if (access) {
        return NstSvcPlaceAccessStorage.set(placeId, access);
      }
    };

    /**
     * Retrieves Access list on Place
     *
     * @param placeId
     * @param qAccess
     * @param forceRequest
     *
     * @return {Promise}
     */
    PlaceFactory.prototype.hasAccess = function (placeId, qAccess, forceRequest) {
      var deferred = $q.defer();
      qAccess = angular.isArray(qAccess) ? qAccess : [qAccess];

      this.getAccessOnPlace(placeId, forceRequest).then(function (actAccess) {
        var difference = _.difference(qAccess, actAccess);
        deferred.resolve(0 == difference.length);
      }).catch(deferred.reject);

      return deferred.promise;
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
        }

        place.setParent(parent);
      }

      if (placeData.grand_parent_id) {
        var grandParent = NstSvcTinyPlaceStorage.get(placeData.grand_parent_id) || NstSvcPlaceStorage.get(placeData.grand_parent_id);
        if (!grandParent) {
          grandParent = this.parseTinyPlace({
            _id: placeData.grand_parent_id
          });
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
      var place = this.createPlaceModel();

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
        }

        place.setParent(parent);
      }

      if (placeData.grand_parent_id) {
        var grandParent = NstSvcPlaceStorage.get(placeData.grand_parent_id) || NstSvcTinyPlaceStorage.get(placeData.grand_parent_id);
        if (!grandParent) {
          grandParent = this.parseTinyPlace({
            _id: placeData.grand_parent_id
          });
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
          locked: placeData.privacy.locked,
          receptive: placeData.privacy.receptive,
          search: placeData.privacy.search
        });
      }


      if (angular.isObject(placeData.policy)) {
        place.setPolicy({
          add_place: placeData.policy.add_place,
          add_member: placeData.policy.add_member,
        });
      }

      if (placeData.access) {
        this.setAccessOnPlace(place.getId(), placeData.access);
      }

      if (placeData.role) {
        this.setRoleOnPlace(place.getId(), placeData.role);
      }
      return place;
    };

    PlaceFactory.prototype.createPlaceModel = function (model) {
      return new NstPlace(model);
    };

    PlaceFactory.prototype.promoteMember = function (placeId, memberId) {
      var defer = $q.defer();

      NstSvcServer.request('place/promote_member', {
        place_id: placeId,
        member_id: memberId
      }).then(function (result) {
        defer.resolve();
      }).catch(function (error) {
        defer.reject(error);
      });

      return defer.promise;
    }

    PlaceFactory.prototype.demoteMember = function (placeId, memberId) {
      var defer = $q.defer();

      NstSvcServer.request('place/demote_member', {
        place_id: placeId,
        member_id: memberId
      }).then(function (result) {
        defer.resolve();
      }).catch(function (error) {
        defer.reject(error);
      });

      return defer.promise;
    };

    PlaceFactory.prototype.placeIdServerCheck = function (id) {
      var defer = $q.defer();

      NstSvcServer.request('place/exists', {
        place_id: id
      }).then(function (data) {
        defer.resolve(data.exists);
      }).catch(function (error) {
        defer.reject(error);
      });

      return defer.promise;
    };

    PlaceFactory.prototype.removePlaceFromTree = function (tree, placeId) {
      removePlace(tree, placeId);
    }

    PlaceFactory.prototype.filterPlacesByRemovePostAccess = function (places) {
      return this.filterPlacesByAccessCode(places, NST_PLACE_ACCESS.REMOVE_POST);
    }

    PlaceFactory.prototype.filterPlacesByReadPostAccess = function (places) {
      return this.filterPlacesByAccessCode(places, NST_PLACE_ACCESS.READ);
    }

    PlaceFactory.prototype.filterPlacesByAccessCode = function (places, code) {
      var defer = $q.defer();
      var factory = this;

      var accessPromises = _.map(places, function (place) {
        return $q(function (resolve, reject) {
            factory.hasAccess(place.id, code).then(function (hasAccess) {
              resolve(hasAccess ? place : null);
            }).catch(reject);
        });
      });

      $q.all(accessPromises).then(function (places) {
        defer.resolve(_.filter(places, function (place) {
          return !_.isNull(place);
        }));
      }).catch(defer.reject);

      return defer.promise;
    }

    PlaceFactory.prototype.addPlaceToTree = function (tree, place) {
      addPlace(tree, place);
    }

    PlaceFactory.prototype.updatePlaceInTree = function (tree, place) {
      updatePlace(tree, place);
    }

    /**
     * addPlace - Finds parent of a place and puts the place in its children
     *
     * @param  {NstVmPlace[]} places    The tree of places
     * @param  {NstVmPlace}   place     A new place
     * @param  {String}       parentId  Current parent Id
     * @param  {Number}       depth     Current depth
     * @return {Bolean}                 Returns true if the place was added
     */
    function addPlace(places, place, parentId, depth) {
      if (!_.isArray(places) || !place) {
        return false;
      }

      depth = depth || 0;

      var placeIdSlices = _.split(place.id, '.');
      // set the root place as parent Id for the first time
      parentId = parentId || _.first(placeIdSlices);
      var parent = _.find(places, { id : parentId });
      // For example, if parentId='ronak' and placeId='ronak.dev.web' then trailingIds whould be ['dev', 'web']
      var trailingIds = _.difference(placeIdSlices, _.split(parentId, '.'));
      if (trailingIds.length > 0) {
        depth ++;
        var nextParentId = _.join(_.concat(parentId,_.first(trailingIds)), '.');
        return addPlace(parent.children, place, nextParentId, depth);
      } else {
        if (_.has(place, 'depth')){
          place.depth = depth;
        }
        if (!_.some(places, { id : place.id })) {
          places.push(place);
          return true;
        }
      }

      return false;
    }

    function updatePlace(places, place, depth) {
      if (!_.isArray(places) || places.length === 0) {
        return false;
      }


      var placeLevels = _.split(place.id,'.');
      depth = depth || 0;

      if(depth == placeLevels.length -1){
        var itemIndex = _.findIndex(places, {id : place.id});
        places[itemIndex] = place;
        places[itemIndex].depth = depth;
        return true;
      }else{
        var parentId = _.take(placeLevels, depth + 1).join('.');
        var parentIndex = _.findIndex(places, {id : parentId});
        updatePlace(places[parentIndex].children, place, depth + 1)
      }

    }

    function removePlace(places, originalId, parentId) {
      if (!_.isArray(places) || places.length === 0 || !originalId) {
        return false;
      }

      var removed = removeItemById(places, originalId);
      if (removed) {
        return true;
      }

      // parentId is null for the first time.
      parentId = parentId || _.first(_.split(originalId, '.'));
      var parent = _.find(places, { id : parentId });
      var childId = getChildId(originalId, parentId);
      removePlace(parent.children, originalId, childId);
    }

    /**
     * getChildId - Finds the next childId by matching the parentId and originalId
     *
     * @param  {String} originalId Id of the place that should be removed
     * @param  {String} parentId   Id of the place parent
     * @return {String}            The next child that might be the parent of the place
     */
    function getChildId(originalId, parentId) {
      var withoutParent = originalId.substring(parentId.length + 1);
      return parentId + '.' + _.first(_.split(withoutParent, '.'));
    }

    function removeItemById(list, id) {
      var childIndex = _.findIndex(list, { id : id });
      if (childIndex > -1) {
        list.splice(childIndex, 1);
        return true; // found and removed
      }

      return false;
    }

    function updateItemById(list, id , place) {
      var childIndex = _.findIndex(list, { id : id });
      if (childIndex > -1) {
        list[childIndex] = place;
        return true; // found and updated
      }

      return false;
    }


    return new PlaceFactory();
  }
})();
