(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceFactory', NstSvcPlaceFactory);

  function NstSvcPlaceFactory($q, _, $rootScope, $window,
                              NST_SRV_ERROR, NST_PLACE_ACCESS, NST_EVENT_ACTION, NST_PLACE_EVENT,
                              NstSvcServer, NstSvcPlaceStorage, NstSvcTinyPlaceStorage, NstSvcMyPlaceIdStorage, NstSvcUserFactory, NstSvcPlaceRoleStorage, NstSvcPlaceAccessStorage, NstSvcLogger,
                              NstBaseFactory, NstFactoryQuery, NstFactoryError, NstUtility, NstTinyPlace, NstPlace, NstFactoryEventData, NstSvcPlaceMap, NstPicture,
                              NstPlaceCreatorOfParentError, NstPlaceOneCreatorLeftError, NstManagerOfSubPlaceError, NstUtilPlace) {
    function PlaceFactory() {
      var factory = this;

      NstSvcServer.addEventListener(NST_EVENT_ACTION.PLACE_ADD, function (event) {
        var tlData = event.detail;

        var isGrandPlace = tlData.place_id && !tlData.child_id;
        var isSubPlace = tlData.place_id && tlData.child_id;

        if (isGrandPlace) {
          factory.getTiny(tlData.place_id).then(function (place) {
            $rootScope.$broadcast(NST_PLACE_EVENT.ROOT_ADDED, { placeId: place.id, place: place });
          });
        } else if (isSubPlace) {
          factory.getTiny(tlData.child_id).then(function (place) {
            $rootScope.$broadcast(NST_PLACE_EVENT.SUB_ADDED, { placeId: place.id, place: place });
          });
        }
      });

      NstSvcServer.addEventListener(NST_EVENT_ACTION.PLACE_REMOVE, function (event) {
        var tlData = event.detail;

        factory.getTiny(tlData.place_id).then(function (parentPlace) {
          $rootScope.$broadcast(NST_PLACE_EVENT.REMOVED, { placeId: tlData.child_id });
        });

        $rootScope.$broadcast(NST_PLACE_EVENT.UPDATED, { placeId: tlData.child_id });

      });

      NstSvcServer.addEventListener(NST_EVENT_ACTION.PLACE_PICTURE, function (event) {
        var tlData = event.detail;
        factory.getTiny(tlData.place_id).then(function (place) {
          $rootScope.$broadcast(NST_PLACE_EVENT.PICTURE_CHANGED, { placeId: place.id, place: place });
        });
      });

      NstBaseFactory.call(this);
    }

    PlaceFactory.prototype = new NstBaseFactory();

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
    PlaceFactory.prototype.get = function (id, force) {
      var factory = this;

      return factory.sentinel.watch(function () {

        return $q(function (resolve, reject) {
          var query = new NstFactoryQuery(id);

          var place = NstSvcPlaceStorage.get(query.id);
          if (place && !force) {
            resolve(place);
          } else {

            NstSvcServer.request('place/get', {
              place_id: query.id
            }).then(function (placeData) {
              // TODO: The response should contains "data" property
              var place = factory.parsePlace(placeData);
              NstSvcPlaceStorage.set(query.id, place);
              resolve(place);
            }).catch(function (error) {
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });

          }
        });
      }, "get", id);
    }

    /**
     * Retrieves a place by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.getTiny = function (id) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var query = new NstFactoryQuery(id);

        return $q(function (resolve, reject) {
          var place = NstSvcPlaceStorage.get(query.id) || NstSvcTinyPlaceStorage.get(query.id);

          if (place) {
            resolve(place);
          } else {
            factory.get(query.id).then(function (place) {
              NstSvcTinyPlaceStorage.set(query.id, place);
              resolve(place);
            }).catch(reject);
          }
        });
      }, "getTiny", id);

    }

    /**
     * Retrieves a place by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.getChildrens = function (id) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var query = new NstFactoryQuery(id);

        return $q(function (resolve, reject) {
          var place = NstSvcPlaceStorage.get(query.id) || NstSvcTinyPlaceStorage.get(query.id);

          if (place) {
            console.log(place);
            resolve(place);
          } else {
            factory.get(query.id).then(function (place) {
              NstSvcTinyPlaceStorage.set(query.id, place);
              resolve(place);
            }).catch(reject);
          }
        });
      }, "getTiny", id);

    }

    PlaceFactory.prototype.getTinySafe = function (id) {
      var service = this;
      return $q(function (resolve) {
        service.getTiny(id).then(function (place) {
          resolve(place);
        }).catch(function () {
          resolve({id: id});
        });
      });
    };

    /**
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.getMyTinyPlaces = function () {
      var factory = this;

      return this.sentinel.watch(function () {
        var query = new NstFactoryQuery();
        return $q(function (resolve, reject) {
          var placeIds = NstSvcMyPlaceIdStorage.get('tiny');
          if (placeIds) {
            resolveMap(placeIds).then(resolve);
          } else {
            NstSvcServer.request('account/get_all_places', {
              with_children: true
            }).then(function (data) {
              var placeIds = data.places.map(createMap);
              NstSvcMyPlaceIdStorage.set('tiny', placeIds);
              resolveMap(placeIds).then(resolve);
            }).catch(function (error) {
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        });
      }, "getMyTinyPlaces");

      function resolveMap(placeIds) {
        var deferred = $q.defer();
        var promises = [];

        for (var k in placeIds) {
          (function (placeId) {
            promises.push(factory.getTiny(placeId.id).then(function (place) {
              var placeClone = angular.copy(place);

              var deferred = $q.defer();

              placeClone.children = placeIds.filter(function (obj) {
                return obj.id.indexOf(placeId.id + '.') === 0;
              });


              if (placeClone.children.length > 0) {
                resolveMap(placeClone.children).then(function (places) {
                  placeClone.children = places;

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
          var places = {
            length: promises.length
          };
          for (var k in promises) {
            places[promises[k].id] = promises[k];
          }
          deferred.resolve(places);
        });

        return deferred.promise;
      }

      function createMap(placeData) {
        var place = factory.parsePlace(placeData);
        var map = {
          id: place.id,
          children: place.children
        };

        factory.set(place);

        if (placeData.childs && placeData.childs.length > 0) {
          map.children = placeData.childs.map(createMap);
        }

        return map;
      }

    }

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
        $rootScope.$broadcast(NST_PLACE_EVENT.ROOT_ADDED, { placeId: place.id, place: place });
        deferred.resolve(place);
      }).catch(deferred.reject);

      return deferred.promise;
    };

    PlaceFactory.prototype.create = function (model, placeType) {
      var deferred = $q.defer();
      var factory = this;

      if (!placeType) {
        throw 'PLACE-FACTORY | Place Type is not defined.'
      }

      var fillMembers = {
        none: 'none',
        parent: '_parent',
        grand: '_grand'
      };

      var params = {
        'place_id': model.id,
        'place_name': model.name,
        'place_description': model.description,
        'privacy.locked': model.privacy.locked,
        'privacy.receptive': model.privacy.receptive,
        'privacy.search': model.privacy.search,
        'policy.add_post': model.policy.addPost,
        'policy.add_member': model.policy.addMember,
        'policy.add_place': model.policy.addPlace,
        'with_members': fillMembers[model.fillMembers]
      };


      //TODO :// fix response data
      NstSvcServer.request('place/' + placeType, params).then(function (data) {
        factory.get(data._id).then(function (place) {

          if (NstUtility.place.hasParent(place.id)) {
            $rootScope.$broadcast(NST_PLACE_EVENT.SUB_ADDED, { placeId: place.id, place: place });
          } else {
            $rootScope.$broadcast(NST_PLACE_EVENT.ROOT_ADDED, { placeId: place.id, place: place });
          }

          deferred.resolve(place);
        }).catch(deferred.reject);
      }).catch(function (error) {
        // TODO: log the error and return a meaningfull error to controller
        deferred.reject(error);
      });

      return deferred.promise;
    };

    PlaceFactory.prototype.update = function (placeId, model) {
      var factory = this;
      var deferred = $q.defer();

      var params = model;
      model.place_id = placeId;

      NstSvcServer.request('place/update', params).then(function () {

        NstSvcPlaceStorage.remove(placeId);
        NstSvcTinyPlaceStorage.remove(placeId);

        factory.getTiny(placeId).then(function (place) {
          $rootScope.$broadcast(NST_PLACE_EVENT.UPDATED, { placeId: placeId, place: place });
          deferred.resolve(place);
        });

      }).catch(deferred.reject);

      return deferred.promise;
    };

    PlaceFactory.prototype.updatePicture = function (id, uid) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id, {
          uid: uid
        });

        factory.hasAccess(query.id, [NST_PLACE_ACCESS.CONTROL]).then(function (has) {
          if (!has) {
            deferred.reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
          }

          NstSvcServer.request('place/set_picture', {
            place_id: id,
            universal_id: uid
          }).then(function (response) {

            factory.get(id, true).then(function (place) {
              $rootScope.$broadcast(NST_PLACE_EVENT.PICTURE_CHANGED, { placeId: place.id, place: place });
            });

            deferred.resolve(response);
          }).catch(function (error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }).catch(function () {
          deferred.reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
        });

        return deferred.promise;
      }, "updatePicture", id);
    }

    PlaceFactory.prototype.remove = function (id) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        factory.hasAccess(query.id, [NST_PLACE_ACCESS.REMOVE_PLACE]).then(function (has) {
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

              $rootScope.$broadcast(NST_PLACE_EVENT.REMOVED, { placeId: place.id, place: place });

              deferred.resolve(place);
            }).catch(function (error) {
              deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }).catch(function (error) {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });

        return deferred.promise;
      }, "remove", id);
    }

    PlaceFactory.prototype.getNotificationOption = function (id) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('place/get_notification', {
          place_id: id
        }).then(function (data) {
          deferred.resolve(data.state);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "getNotificationOption", id);
    };

    PlaceFactory.prototype.setNotificationOption = function (id, value) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request('place/set_notification', {
          place_id: id,
          state: !!value
        }).then(function () {
          $rootScope.$broadcast(NST_PLACE_EVENT.NOTIFICATION, { placeId: id, notification: value });
          deferred.resolve(true);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "setNotificationOption", id);
    }

    PlaceFactory.prototype.getFavoritesPlaces = function () {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery();

        NstSvcServer.request('account/get_favorite_places', {})
          .then(function (data) {
            var flatArray = data.places.map(function (place) {
              return place._id
            });
            deferred.resolve(flatArray);
          }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "getFavoritesPlaces");
    };

    PlaceFactory.prototype.setBookmarkOption = function (id, value) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var requestCommad = value ? 'place/add_favorite' : 'place/remove_favorite';

        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        NstSvcServer.request(requestCommad, {
          place_id: id
        }).then(function () {
          $rootScope.$broadcast('place-bookmark', { placeId: id, bookmark: value});
          deferred.resolve(true);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "setBookmarkOption", id);
    }

    PlaceFactory.prototype.searchForCompose = function (keyword, limit) {
      var factory = this;
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(keyword);

        NstSvcServer.request('search/places_for_compose', {
          keyword: keyword,
          limit: limit || 10
        }).then(function (response) {
          var places = [];
          for (var k in response.places) {
            var place = factory.parseTinyPlace(response.places[k]);
            factory.set(place);
            places.push(place);
          }

          deferred.resolve({
            places: places,
            recipients: response.recipients
          });
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "search", keyword);
    };

    PlaceFactory.prototype.search = function (keyword) {
      var factory = this;
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(keyword);

        NstSvcServer.request('search/places_for_search', {
          keyword: keyword
        }).then(function (response) {
          var places = [];
          for (var k in response.places) {
            var place = factory.parseTinyPlace(response.places[k]);
            factory.set(place);
            places.push(place);
          }

          deferred.resolve(places);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "search", keyword);
    };

    PlaceFactory.prototype.addUser = function (place, users) {
      var factory = this;
      var userIds = _.isArray(users)
        ? _.join(_.map(users, 'id'), ',')
        : users;

      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/add_member', {
          place_id: place.id,
          member_id: userIds
        }).then(function (result) {
          var notAddedIds = result.invalid_ids || [];
          var addedUsers = _.reject(users, function (user) {
            return _.includes(notAddedIds, user.id);
          });
          deferred.resolve({
            addedUsers: addedUsers,
            rejectedUsers: _.differenceBy(users, addedUsers, 'id')
          });
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "addUser", place.id + '-' + userIds);

    };

    PlaceFactory.prototype.inviteUser = function (place, users) {
      var deferred = $q.defer();
      var userIds = _.isArray(users)
        ? _.join(_.map(users, 'id'), ',')
        : users;

      NstSvcServer.request('place/invite_member', {
        place_id: place.id,
        member_id: userIds
      }).then(function (result) {
        console.log('invite result', result);
        var notAddedIds = result.invalid_ids || [];
        var addedUsers = _.reject(users, function (user) {
          return _.includes(notAddedIds, user.id);
        });
        deferred.resolve({
          addedUsers: addedUsers,
          rejectedUsers: _.differenceBy(users, addedUsers, 'id')
        });
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(userIds, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;

    }

    PlaceFactory.prototype.removeMember = function (placeId, memberId) {
      var factory = this;
      var id = placeId + "-" + memberId;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id, {
          placeId: placeId,
          memberId: memberId
        });

        NstSvcServer.request('place/remove_member', {
          place_id: query.data.placeId,
          member_id: query.data.memberId
        }).then(function () {
          NstSvcLogger.debug(NstUtility.string.format('User "{0}" was removed from place "{1}".', memberId, placeId));
          if (NstUtilPlace.isGrand(placeId)) {
            factory.getGrandPlaceChildren(placeId).then(function (places) {
              NstSvcTinyPlaceStorage.set(placeId, places);
            }).catch(function () {
              NstSvcLogger.debug('Cant resolve in remove member');
            });
          }
          deferred.resolve();
        }).catch(function (error) {
          if (error.getCode() === NST_SRV_ERROR.ACCESS_DENIED) {
            if (error.previous.items[0] === 'last_creator') {
              deferred.reject(new NstPlaceOneCreatorLeftError(error));
            } else if (error.previous.items[0] === 'parent_creator') {
              deferred.reject(new NstPlaceCreatorOfParentError(error));
            }

          } else {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          }
        });

        return deferred.promise;
      }, "removeMember", id);
    };

    PlaceFactory.prototype.leave = function (placeId) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(placeId);

        NstSvcServer.request('place/leave', {
          place_id: placeId
        }).then(function () {
          NstSvcPlaceStorage.remove(query.id);
          NstSvcTinyPlaceStorage.remove(query.id);
          $rootScope.$broadcast(NST_PLACE_EVENT.REMOVED, { placeId: placeId });
          factory.get(placeId, true).then(function () {
            deferred.resolve();
          });
        }).catch(function (error) {
          if (error.getCode() === NST_SRV_ERROR.ACCESS_DENIED) {
            if (error.previous.items[0] === 'last_creator') {
              deferred.reject(new NstPlaceOneCreatorLeftError(error));
            } else if (error.previous.items[0] === 'parent_creator') {
              deferred.reject(new NstPlaceCreatorOfParentError(error));
            } else if (error.previous.items[0] === "cannot_leave_some_subplaces") {
              deferred.reject(new NstManagerOfSubPlaceError(error));
            } else {
              deferred.reject(error);
            }

          } else {
            deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          }
        });

        return deferred.promise;
      }, "leave", placeId);
    };

    PlaceFactory.prototype.getCreators = function (id, limit, skip) {
      var deferred = $q.defer();
      var query = new NstFactoryQuery(id, {
        limit: limit,
        skip: skip
      });

      NstSvcServer.request('place/get_creators', {
        place_id: id,
        limit: limit,
        skip: skip
      }).then(function (data) {
        var creators = _.map(data.creators, function (creator) {
          return NstSvcUserFactory.parseTinyUser(creator);
        });

        deferred.resolve({
          creators: creators,
          total: data.total
        });
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    };

    PlaceFactory.prototype.getKeyholders = function (id, limit, skip) {
      var deferred = $q.defer();
      var query = new NstFactoryQuery(id, {
        limit: limit,
        skip: skip
      });

      NstSvcServer.request('place/get_key_holders', {
        place_id: id,
        limit: limit,
        skip: skip
      }).then(function (data) {
        var keyHolders = _.map(data.key_holders, function (keyHolder) {
          return NstSvcUserFactory.parseTinyUser(keyHolder);
        });

        deferred.resolve({
          keyHolders: keyHolders,
          total: data.total
        });
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
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

    PlaceFactory.prototype.setRoleOnPlace = function (placeId, role) {
      if (role) {
        NstSvcPlaceRoleStorage.set(placeId, role);
      }
    };

    PlaceFactory.prototype.getAccessOnPlace = function (id, forceRequest) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        var query = new NstFactoryQuery(id);

        var placeAccess = NstSvcPlaceAccessStorage.get(id);
        if (placeAccess && !forceRequest) {
          deferred.resolve(placeAccess);
        } else {
          NstSvcServer.request('place/get_access', {
            place_ids: id
          }).then(function (response) {
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
                var placeInfo = response.places[0];
                access = placeInfo.access;
                factory.setAccessOnPlace(id, placeInfo.access);
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

        return deferred.promise;
      }, "getAccessOnPlace", id);
    }

    PlaceFactory.prototype.setAccessOnPlace = function (placeId, access) {
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
        if (this.has(place.id)) {
          NstSvcPlaceStorage.merge(place.id, place);
        } else {
          NstSvcPlaceStorage.set(place.id, place);
        }
      } else if (place instanceof NstTinyPlace) {
        if (this.hasTiny(place.id)) {
          NstSvcTinyPlaceStorage.merge(place.id, place);
        } else {
          NstSvcTinyPlaceStorage.set(place.id, place);
        }
      }

      return this;
    };

    PlaceFactory.prototype.parseTinyPlace = function (placeData) {
      var place = new NstTinyPlace();

      place.id = placeData._id;
      place.name = placeData.name;
      place.description = placeData.description;
      place.picture = new NstPicture(placeData.picture);
      place.accesses = placeData.access;

      return place;
    };

    PlaceFactory.prototype.parsePlace = function (placeData) {
      var place = new NstPlace();

      place.id = placeData._id;
      place.unreadPosts = placeData.unread_posts;
      place.name = placeData.name;
      place.description = placeData.description;
      place.picture = new NstPicture(placeData.picture);
      place.grandParentId = placeData.grand_parent_id;
      place.privacy = placeData.privacy;
      place.policy = placeData.policy;
      place.counters = placeData.counters;
      place.accesses = placeData.access;

      return place;
    };

    PlaceFactory.prototype.promoteMember = function (placeId, memberId) {
      var id = placeId + "-" + memberId;
      var query = new NstFactoryQuery(id, {
        placeId: placeId,
        memberId: memberId
      });

      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/promote_member', {
          place_id: query.data.placeId,
          member_id: query.data.memberId
        }).then(function () {
          deferred.resolve();
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, id);
    }

    PlaceFactory.prototype.demoteMember = function (placeId, memberId) {
      var id = placeId + "-" + memberId;
      var query = new NstFactoryQuery(id, {
        placeId: placeId,
        memberId: memberId
      });

      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/demote_member', {
          place_id: query.data.placeId,
          member_id: query.data.memberId
        }).then(function () {
          deferred.resolve();
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, id);
    };

    PlaceFactory.prototype.removePlaceFromTree = function (tree, placeId, parentId) {
      removePlace(tree, placeId, parentId);
    }

    PlaceFactory.prototype.filterPlacesByRemovePostAccess = function (places) {
      return this.filterPlacesByAccessCode(places, NST_PLACE_ACCESS.REMOVE_POST);
    }

    PlaceFactory.prototype.filterPlacesByReadPostAccess = function (places) {
      return this.filterPlacesByAccessCode(places, NST_PLACE_ACCESS.READ);
    }

    PlaceFactory.prototype.filterPlacesByControlAccess = function (places) {
      return this.filterPlacesByAccessCode(places, NST_PLACE_ACCESS.CONTROL);
    }

    PlaceFactory.prototype.getChildTree = function (grandPlace, children) {
      var mapper = new NstSvcPlaceMap();
      mapper.toTree(grandPlace, children);
    };

    PlaceFactory.prototype.filterPlacesByAccessCode = function (places, code) {
      return _.filter(places, function (place) {
        return _.includes(place.accesses, code);
      });
    };

    PlaceFactory.prototype.addPlaceToTree = function (tree, place) {
      addPlace(tree, place);
    };

    PlaceFactory.prototype.updatePlaceInTree = function (tree, place) {
      updatePlace(tree, place);
    };

    PlaceFactory.prototype.getGrandPlaces = function () {
      var factory = this;
      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('account/get_all_places', {}).then(function (data) {
          if (data && _.isArray(data.places) && !_.isEmpty(data.places)) {
            deferred.resolve(_.map(data.places, function (place) {
              return factory.parseTinyPlace(place);
            }));
          } else {
            deferred.resolve([]);
          }
        }).catch(function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, "getGrandPlaces");
    };

    PlaceFactory.prototype.getGrandPlaceChildren = function (grandPlaceId) {
      var factory = this;
      return this.sentinel.watch(function () {
        var deferred = $q.defer();
        var places = [];
        var starredPlaces = [];

        NstSvcServer.request('place/get_sub_places', {
          place_id: grandPlaceId
        }).then(function (data) {
          if (_.isArray(data.places) && !_.isEmpty(data.places)) {
            places = data.places;
          }

          return NstSvcServer.request('account/get_favorite_places', {});
        }).then(function (data) {
          starredPlaces = data.places;
          deferred.resolve(_.map(places, function (place) {
            var model = factory.parseTinyPlace(place);
            model.isStarred = _.includes(starredPlaces, model.id);
            return model;
          }));
        }).catch(function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, "getGrandPlaceChildren", grandPlaceId);
    };

    PlaceFactory.prototype.getAccess = function (placeId) {
      var id = null;
      if (_.isArray(placeId)) {
        id = _.join(placeId, ",");
      } else {
        id = placeId;
      }
      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/get_access', {
          place_id: id
        }).then(function (data) {
          deferred.resolve(_.map(data.places, function (place) {
            return {
              id: place._id,
              accesses: place.access
            };
          }));
        }).catch(deferred.reject);

        return deferred.promise;
      }, id);
    };

    PlaceFactory.prototype.getMutualPlaces = function (accountId) {
      var factory = this;
      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/get_mutual_places', {
          account_id: accountId
        }).then(function (data) {
          deferred.resolve(_.map(data.places, factory.parseTinyPlace));
        }).catch(deferred.reject);

        return deferred.promise;
      }, "getMutualPlaces_" + accountId);
    }

    /**
     * Mark all place's posts as read
     *
     * @param  {string}      placeId  a place id
     *
     * @returns {Promise}      boolean result
     */
    PlaceFactory.prototype.markAllPostAsRead = function (placeId) {

      var factory = this;
      var defer = $q.defer();

      var query = new NstFactoryQuery(placeId);

      if (!placeId) {
        throw "place id is not define!";
      } else {
        placeId = placeId;
      }


      if (!query.id) {
        defer.resolve(null);
      } else {
        NstSvcServer.request('place/mark_all_read', {
          place_id: placeId
        }).then(function () {

          $rootScope.$broadcast('post-read-all', { placeId: placeId });
          defer.resolve(true);

        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

      }

      return defer.promise;
    }


    /**
     * Get unread posts count of places
     *
     * @returns {jQuery.promise|*|promise}
     */
    PlaceFactory.prototype.getPlacesUnreadPostsCount = function (placesId, subs) {
      var separatedIds = placesId.join(",");
      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        if (!_.isArray(placesId)) {
          throw "Place Id must be an array.";
        }

        NstSvcServer.request('place/count_unread_posts', {
          "place_id": separatedIds,
          "subs": subs ? true : false
        }).then(function (data) {
          deferred.resolve(data.counts)
        }).catch(function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, "getPlacesUnreadPostsCount" + separatedIds, subs);
    };

    PlaceFactory.prototype.flush = function () {
      NstSvcPlaceStorage.flush();
      NstSvcTinyPlaceStorage.flush();
      NstSvcMyPlaceIdStorage.flush();
      NstSvcPlaceRoleStorage.flush();
    };

    PlaceFactory.prototype.isIdAvailable = isIdAvailable;

    PlaceFactory.prototype.getPlacesWithCreatorFilter = function () {
      var factory = this;
      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('account/get_all_places', {
          with_children: true,
          filter: 'creator'
        }).then(function (data) {
          deferred.resolve(_.map(data.places, factory.parseTinyPlace));
        }).catch(function (error) {
          reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "getPlacesWithCreatorFilter");
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
      var parent = _.find(places, {
        id: parentId
      });
      if (!parent) {
        return false;
      }
      // For example, if parentId='ronak' and placeId='ronak.dev.web' then trailingIds whould be ['dev', 'web']
      var trailingIds = _.difference(placeIdSlices, _.split(parentId, '.'));
      if (trailingIds.length > 0) {
        depth++;
        var nextParentId = _.join(_.concat(parentId, _.first(trailingIds)), '.');
        return addPlace(parent.children, place, nextParentId, depth);
      } else {
        if (_.has(place, 'depth')) {
          place.depth = depth;
        }
        if (!_.some(places, {
            id: place.id
          })) {
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


      var placeLevels = _.split(place.id, '.');
      depth = depth || 0;

      if (depth == placeLevels.length - 1) {
        var itemIndex = _.findIndex(places, {
          id: place.id
        });
        places[itemIndex] = place;
        places[itemIndex].depth = depth;
        return true;
      } else {
        var parentId = _.take(placeLevels, depth + 1).join('.');
        var parentIndex = _.findIndex(places, {
          id: parentId
        });
        updatePlace(places[parentIndex].children, place, depth + 1)
      }

    }

    function removePlace(places, originalId, parentId) {
      if (!(_.isArray(places) && places.length > 0)) {
        return false;
      }
      if (_.some(places, {id: originalId})) {
        NstUtility.collection.dropById(places, originalId);
        return true;
      }

      // parentId is null for the first time.
      parentId = parentId || NstUtility.place.getGrandId(originalId);
      var parent = _.find(places, {
        id: parentId
      });
      if (!parent) {
        return false;
      }

      var childId = getNextChild(originalId, parentId);
      removePlace(parent.children, originalId, childId);
    }

    /**
     * getNextChild - Finds the next childId by matching the parentId and originalId
     *
     * @param  {String} originalId Id of the place that should be removed
     * @param  {String} parentId   Id of the place parent
     * @return {String}            The next child that might be the parent of the place
     */
    function getNextChild(originalId, parentId) {
      var withoutParent = originalId.substring(parentId.length + 1);
      return parentId + '.' + _.first(_.split(withoutParent, '.'));
    }

    function isIdAvailable(id) {
      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/available', {
          place_id: id
        }).then(function () {
          deferred.resolve(true);
        }).catch(function (reason) {
          if (reason === NST_SRV_ERROR.UNAVAILABLE) {
            deferred.resolve(true);
          } else {
            deferred.reject(reason)
          }
        });

        return deferred.promise;
      }, "isIdAvailable", id);
    }

    return new PlaceFactory();
  }
})();
