(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceFactory', NstSvcPlaceFactory);

  function NstSvcPlaceFactory($q, _, $rootScope,
                              NST_SRV_ERROR, NST_PLACE_ACCESS, NST_EVENT_ACTION, NST_PLACE_EVENT,
                              NstSvcServer, NstSvcUserFactory, NstSvcLogger, NstSvcGlobalCache,
                              NstBaseFactory, NstUtility, NstTinyPlace, NstPlace, NstPicture, NstUtilPlace, NstCollector) {
    function PlaceFactory() {
      var factory = this;

      NstSvcServer.addEventListener(NST_EVENT_ACTION.PLACE_ADD, function (event) {
        var tlData = event.detail;

        var isGrandPlace = tlData.place_id && !tlData.child_id;
        var isSubPlace = tlData.place_id && tlData.child_id;

        if (isGrandPlace) {
          factory.get(tlData.place_id).then(function (place) {
            $rootScope.$broadcast(NST_PLACE_EVENT.ROOT_ADDED, {placeId: place.id, place: place});
          });
        } else if (isSubPlace) {
          factory.get(tlData.child_id).then(function (place) {
            $rootScope.$broadcast(NST_PLACE_EVENT.SUB_ADDED, {placeId: place.id, place: place});
          });
        }
      });

      NstSvcServer.addEventListener(NST_EVENT_ACTION.PLACE_REMOVE, function (event) {
        var tlData = event.detail;

        factory.get(tlData.place_id).then(function () {
          $rootScope.$broadcast(NST_PLACE_EVENT.REMOVED, {placeId: tlData.child_id});
        });

        $rootScope.$broadcast(NST_PLACE_EVENT.UPDATED, {placeId: tlData.child_id});

      });

      NstSvcServer.addEventListener(NST_EVENT_ACTION.PLACE_PICTURE, function (event) {
        var tlData = event.detail;
        factory.get(tlData.place_id).then(function (place) {
          $rootScope.$broadcast(NST_PLACE_EVENT.PICTURE_CHANGED, {placeId: place.id, place: place});
        });
      });

      NstSvcServer.addEventListener(NST_EVENT_ACTION.MEMBER_JOIN, function (/*event*/) {
        // var tlData = event.detail;
      });

      this.cache = NstSvcGlobalCache.createProvider('place');
      this.collector = new NstCollector('place', this.getMany);

      NstBaseFactory.call(this);
    }

    PlaceFactory.prototype = new NstBaseFactory();

    PlaceFactory.prototype.constructor = PlaceFactory;

    /**
     * Retrieves a place by id and store in the related cache storage
     *
     * @param {String} id
     * @param {boolean} normal
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.get = function (id, normal) {
      var deferred = $q.defer();
      var factory = this;
      // first ask the cache provider to give the model
      var cachedPlace = this.getCachedSync(id);
      var withServer = true;
      if (cachedPlace && !normal) {
        // The cached model exists and the place type (normal/tiny) does not matter
        withServer = false;
        deferred.resolve(cachedPlace);
      } else if (normal && cachedPlace && cachedPlace.privacy && cachedPlace.policy) {
        // The cached model exists and only a normal place is accepted
        withServer = false;
        deferred.resolve(cachedPlace);
      }

      // collects all requests for place and send them all using getMany
      this.collector.add(id).then(function (data) {
        // update cache database
        factory.set(data);
        if (withServer) {
          deferred.resolve(factory.parsePlace(data));
        }
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            if (withServer) {
              deferred.resolve();
            }
            factory.cache.remove(id);
            break;

          default:
            if (withServer) {
              deferred.reject(error);
            }
            break;
        }
      });

      return deferred.promise;
    }

    PlaceFactory.prototype.getWithNoCache = function (id) {

      var deferred = $q.defer();
      // collects all requests for place and send them all using getMany
      this.collector.add(id).then(function (data) {
        deferred.resolve(data);
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            deferred.resolve();
            break;

          default:
            deferred.reject(error);
            break;
        }
      });

      return deferred.promise;
    }

    PlaceFactory.prototype.getFresh = function (id) {
      this.cache.remove(id);
      var factory = this;
      return NstSvcServer.request('place/get', {
        place_id: id
      }).then(function (data) {
        factory.set(data);
        return $q.resolve(factory.parsePlace(data));
      });
    }

    PlaceFactory.prototype.getSafe = function (id, normal) {
      var factory = this;
      return $q(function(resolve) {
        factory.get(id, normal).then(function (place) {
          resolve(place);
        }).catch(function () {
          resolve(null);
        });
      });
    }

    PlaceFactory.prototype.getMany = function (id) {
      var joinedIds = id.join(',');
      return NstSvcServer.request('place/get_many', {
        place_id: joinedIds
      }).then(function (data) {
        return $q.resolve({
          idKey: '_id',
          resolves: data.places,
          rejects: data.no_access
        });
      });
    };

    PlaceFactory.prototype.getCachedSync = function (id) {
      return this.parseCachedModel(this.cache.get(id));
    }

    /**
     *
     * @returns {Promise}
     */
    PlaceFactory.prototype.getMyPlaces = function (force) {
      var factory = this;
      var deferred = $q.defer();
      var withServer = true;
      if (!force) {
        var myPlaces = factory.cache.get('_my');

        if (myPlaces && myPlaces.value) {
          var places = _.map(myPlaces.value, function (placeId) {
            return factory.getCachedSync(placeId);
          });

          if (_.every(places, '_id') || _.every(places, 'id')) {
            withServer = false;
            deferred.resolve(places);
          }
        }
      }

      NstSvcServer.request('account/get_all_places', {
        with_children: true
      }).then(function (data) {
        var ids = [];
        var places = _.map(data.places, function(place) {
          ids.push(place._id);
          factory.set(place);
          return factory.parsePlace(place);
        });

        factory.cache.set('_my', {
          value: ids
        });

        if (withServer) {
          deferred.resolve(places);
        }
      }).catch(function (error) {
        if (withServer) {
          deferred.reject(error);
        }
      });

      return deferred.promise;
    };

    PlaceFactory.prototype.getGrandPlaces = function() {
      var factory = this;
      return NstSvcServer.request('account/get_all_places').then(function (data) {
        var places = [];
        _.forEach(data.places, function (place) {
          factory.set(place);
          places.push(factory.parsePlace(place));
        });

        return $q.resolve(places);
      });
    }

    PlaceFactory.prototype.getGrandPlaceChildren = function (grandPlaceId) {
      var factory = this;
      return NstSvcServer.request('place/get_sub_places', {
        place_id: grandPlaceId
      }).then(function (data) {
        var places = [];
        _.forEach(data.places, function(place) {
          factory.set(place);
          places.push(factory.parsePlace(place));
        });

        return $q.resolve(places);
      });
    }

    PlaceFactory.prototype.isInMyPlaces = function (placeId) {
      var factory = this;
      var myPlaces = factory.cache.get('_my');

      if (myPlaces && myPlaces.value) {
        return $q.resolve(_.includes(myPlaces.value, placeId));
      }

      return NstSvcServer.request('account/get_all_places', {
        with_children: true
      }).then(function (data) {
        var ids = [];
        _.forEach(data.places, function (place) {
          ids.push(place._id);
          factory.set(place);
        });

        factory.cache.set('_my', {
          value: ids
        });

        return $q.resolve(_.includes(ids, placeId));
      });
    }

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
            $rootScope.$broadcast(NST_PLACE_EVENT.SUB_ADDED, {placeId: place.id, place: place});
          } else {
            $rootScope.$broadcast(NST_PLACE_EVENT.ROOT_ADDED, {placeId: place.id, place: place});
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
        factory.cache.remove(placeId);

        factory.get(placeId).then(function (place) {
          $rootScope.$broadcast(NST_PLACE_EVENT.UPDATED, {placeId: placeId, place: place});
          deferred.resolve(place);
        });

      }).catch(deferred.reject);

      return deferred.promise;
    };

    PlaceFactory.prototype.updatePicture = function (id, uid) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        // factory.hasAccess(id, [NST_PLACE_ACCESS.CONTROL]).then(function (has) {
        //   if (!has) {
        //     deferred.reject({
        //       err_code: NST_SRV_ERROR.ACCESS_DENIED
        //     });
        //   }

          NstSvcServer.request('place/set_picture', {
            place_id: id,
            universal_id: uid
          }).then(function (response) {
            factory.cache.remove(id);
            factory.get(id, true).then(function (place) {
              $rootScope.$broadcast(NST_PLACE_EVENT.PICTURE_CHANGED, {placeId: place.id, place: place});
            });

            deferred.resolve(response);
          }).catch(deferred.reject);
        // }).catch(deferred.reject);

        return deferred.promise;
      }, "updatePicture", id);
    };

    PlaceFactory.prototype.removePicture = function (id) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();


          NstSvcServer.request('place/set_picture', {
            place_id: id
          }).then(function (response) {
            factory.cache.remove(id);
            factory.get(id, true).then(function (place) {
              $rootScope.$broadcast(NST_PLACE_EVENT.PICTURE_CHANGED, {placeId: place.id, place: place});
            });

            deferred.resolve(response);
          }).catch(deferred.reject);

        return deferred.promise;
      }, "removePicture", id);
    };

    PlaceFactory.prototype.removeCache = function (id) {
      this.cache.remove(id);
    };

    PlaceFactory.prototype.remove = function (id) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        factory.get(id).then(function (place) {
          NstSvcServer.request('place/remove', {
            place_id: id
          }).then(function () {
            // clean up storages
            factory.cache.remove(id);
            var myPlaces = factory.cache.get('_my');
            factory.cache.set('_my', myPlaces);

            $rootScope.$broadcast(NST_PLACE_EVENT.REMOVED, {placeId: place.id, place: place});

            deferred.resolve(place);
          }).catch(deferred.reject);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "remove", id);
    }

    PlaceFactory.prototype.getNotificationOption = function (id) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        NstSvcServer.request('place/get_notification', {
          place_id: id
        }).then(function (data) {
          deferred.resolve(data.state);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "getNotificationOption", id);
    };

    PlaceFactory.prototype.setNotificationOption = function (id, value) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();
        NstSvcServer.request('place/set_notification', {
          place_id: id,
          state: !!value
        }).then(function () {
          $rootScope.$broadcast(NST_PLACE_EVENT.NOTIFICATION, {placeId: id, notification: value});
          deferred.resolve(true);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "setNotificationOption", id);
    }

    PlaceFactory.prototype.getFavoritesPlaces = function () {
      var factory = this;

      return NstSvcServer.request('account/get_favorite_places', {}).then(function (data) {
        var items = _.map(data.places, function(place) {
          factory.set(place);
          return place._id;
        });

        return $q.resolve(items);
      });
    };

    PlaceFactory.prototype.setBookmarkOption = function (id, value) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var requestCommad = value ? 'place/add_favorite' : 'place/remove_favorite';
        var deferred = $q.defer();

        NstSvcServer.request(requestCommad, {
          place_id: id
        }).then(function () {
          $rootScope.$broadcast('place-bookmark', {placeId: id, bookmark: value});
          deferred.resolve(true);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "setBookmarkOption", id);
    };

    var whiteSpaceRegEx = /\s/;
    function moveExactToViewPort(places, keyword) {
      if (_.isString(keyword) && keyword.length > 0 && !whiteSpaceRegEx.test(keyword)) {
        var index = _.findIndex(places, {'_id': keyword});
        var item = {};
        if (index === -1) {
          item = {
            _id: keyword,
            name: keyword,
            description: '',
            place: null,
            access: []
          };
          if (places.length > 5) {
            places.splice(4, 0, item);
          } else {
            places.push(item);
          }
        } else if (index >= 5) {
          item = places[index];
          places.splice(index, 0);
          places.splice(4, 0, item);
        }
      }
    }

    PlaceFactory.prototype.searchForCompose = function (keyword, limit) {
      var factory = this;
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('search/places_for_compose', {
          keyword: keyword,
          limit: limit || 10
        }).then(function (response) {

          var places = response.places;
          moveExactToViewPort(places, keyword);
          deferred.resolve({
            places: _.map(places, function (item) {
              return factory.parseTinyPlace(item);
            }),
            recipients: response.recipients
          });
        }).catch(deferred.reject);

        return deferred.promise;
      }, "search", keyword);
    };

    PlaceFactory.prototype.search = function (keyword) {
      var factory = this;
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('search/places_for_search', {
          keyword: keyword
        }).then(function (response) {
          var places = [];
          _.forEach(response.places, function (place) {
            factory.set(place);
            places.push(factory.parseTinyPlace(place));
          });

          deferred.resolve(places);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "search", keyword);
    };

    PlaceFactory.prototype.addUser = function (place, users) {
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
        }).catch(deferred.reject);

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
        var notAddedIds = result.invalid_ids || [];
        var addedUsers = _.reject(users, function (user) {
          return _.includes(notAddedIds, user.id);
        });
        deferred.resolve({
          addedUsers: addedUsers,
          rejectedUsers: _.differenceBy(users, addedUsers, 'id')
        });
      }).catch(deferred.reject);

      return deferred.promise;

    }

    PlaceFactory.prototype.removeMember = function (placeId, memberId) {
      var factory = this;
      var id = placeId + "-" + memberId;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/remove_member', {
          place_id: placeId,
          member_id: memberId
        }).then(function () {
          NstSvcLogger.debug(NstUtility.string.format('User "{0}" was removed from place "{1}".', memberId, placeId));
          deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
      }, "removeMember", id);
    };

    PlaceFactory.prototype.leave = function (placeId) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/leave', {
          place_id: placeId
        }).then(function () {
          factory.cache.remove(placeId);
          $rootScope.$broadcast(NST_PLACE_EVENT.REMOVED, {placeId: placeId});
          factory.get(placeId, true).then(function () {
            deferred.resolve();
          });
        }).catch(deferred.reject);

        return deferred.promise;
      }, "leave", placeId);
    };

    PlaceFactory.prototype.getCreators = function (id, limit, skip, cacheHandler) {
      var deferred = $q.defer();

      NstSvcServer.request('place/get_creators', {
        place_id: id,
        limit: limit,
        skip: skip
      }, function (cachedResponse) {
        if (!cachedResponse || !_.isFunction(cacheHandler)) return;

        var items = _.chain(cachedResponse.creators).map(function (creator) {
          return NstSvcUserFactory.getCachedSync(creator._id) || NstSvcUserFactory.parseTinyUser(creator);
        }).value();
        cacheHandler(items);
      }).then(function (data) {
        var creators = _.map(data.creators, function (creator) {
          return NstSvcUserFactory.parseTinyUser(creator);
        });

        deferred.resolve({
          creators: creators,
          total: data.total
        });
      }).catch(deferred.reject);

      return deferred.promise;
    };

    PlaceFactory.prototype.getKeyholders = function (id, limit, skip, cacheHandler) {
      var deferred = $q.defer();
      NstSvcServer.request('place/get_key_holders', {
        place_id: id,
        limit: limit,
        skip: skip
      }, function (cachedResponse) {
        if (!cachedResponse || !_.isFunction(cacheHandler)) return;
        var items = _.chain(cachedResponse.key_holders).map(function (keyHolder) {
          return NstSvcUserFactory.getCachedSync(keyHolder._id) || NstSvcUserFactory.parseTinyUser(keyHolder);
        }).value();
        cacheHandler(items);
      }).then(function (data) {
        var keyHolders = _.map(data.key_holders, function (keyHolder) {
          return NstSvcUserFactory.parseTinyUser(keyHolder);
        });

        deferred.resolve({
          keyHolders: keyHolders,
          total: data.total
        });
      }).catch(deferred.reject);

      return deferred.promise;
    };

    PlaceFactory.prototype.set = function (data) {
      if (data && data._id) {
        this.cache.set(data._id, this.transformToCacheModel(data), { merge: true });
      } else {
        // console.error('The data is not valid to be cached!', data);
      }
    };

    PlaceFactory.prototype.parseTinyPlace = function (placeData) {
      if (!(placeData && placeData._id)) {
        return null;
      }

      var place = new NstTinyPlace();

      place.id = placeData._id;
      place.name = placeData.name;
      place.description = placeData.description;
      place.picture = new NstPicture(placeData.picture);
      place.accesses = placeData.access;

      return place;
    };

    PlaceFactory.prototype.parsePlace = function (placeData) {
      if (!(placeData && placeData._id)) {
        return null;
      }

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
      place.limits = placeData.limits;
      place.accesses = placeData.access;
      place.notification = placeData.notification;
      place.favorite = placeData.favorite;
      place.pinned_posts = placeData.
       || [];

      return place;
    };

    PlaceFactory.prototype.parseCachedModel = function (data) {
      if (!data) {
        return null;
      }
      if (data.privacy && data.policy) {
        // The cached place is a perfect one
        return this.parsePlace(data);
      } else {
        // The cached model is a tiny place that has at least _id, name and picture
        return this.parseTinyPlace(data);
      }
    }

    PlaceFactory.prototype.transformToCacheModel = function (place) {
      return place;
    }

    PlaceFactory.prototype.promoteMember = function (placeId, memberId) {
      var id = placeId + "-" + memberId;

      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/promote_member', {
          place_id: placeId,
          member_id: memberId
        }).then(function () {
          deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
      }, id);
    }

    PlaceFactory.prototype.demoteMember = function (placeId, memberId) {
      var id = placeId + "-" + memberId;

      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/demote_member', {
          place_id: placeId,
          member_id: memberId
        }).then(function () {
          deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
      }, id);
    };

    // Deprecated
    PlaceFactory.prototype.filterPlacesByReadPostAccess = function (places) {
      return this.filterPlacesByAccessCode(places, NST_PLACE_ACCESS.READ);
    }

    // Deprecated
    PlaceFactory.prototype.filterPlacesByAccessCode = function (places, code) {
      return _.filter(places, function (place) {
        return _.includes(place.accesses, code);
      });
    };
    // Deprecated
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

    PlaceFactory.prototype.getMutualPlaces = function (accountId, cacheHandler) {
      var factory = this;

      return NstSvcServer.request('place/get_mutual_places', {
        account_id: accountId
      }, function (cachedResponse) {
        if (cachedResponse && _.isFunction(cacheHandler)) {
          var places = _.map(cachedResponse.places, function (place) {
            return factory.getCachedSync(place._id) || factory.parseTinyPlace(place);
          });

          cacheHandler(places);
        }
      }).then(function (data) {
        return $q.resolve(_.map(data.places, factory.parseTinyPlace));
      });
    }

    /**
     * Mark all place's posts as read
     *
     * @param  {string}      placeId  a place id
     *
     * @returns {Promise}      boolean result
     */
    PlaceFactory.prototype.markAllPostAsRead = function (placeId) {

      var defer = $q.defer();

      if (!placeId) {
        defer.resolve(null);
      } else {
        NstSvcServer.request('place/mark_all_read', {
          place_id: placeId
        }).then(function () {

          $rootScope.$broadcast('post-read-all', {placeId: placeId});
          defer.resolve(true);

        }).catch(defer.reject);

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

    PlaceFactory.prototype.isIdAvailable = function (id) {
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
    };

    PlaceFactory.prototype.getPlacesWithCreatorFilter = function () {
      var factory = this;
      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('account/get_all_places', {
          with_children: true,
          filter: 'creator'
        }).then(function (data) {
          deferred.resolve(_.map(data.places, factory.parseTinyPlace));
        }).catch();

        return deferred.promise;
      }, "getPlacesWithCreatorFilter");
    }

    PlaceFactory.prototype.getRecentlyVisitedPlace = function (cacheHandler) {
      var factory = this;

      return NstSvcServer.request('account/GET_RECENTLY_VISITED_PLACES', {}, function(cachedResponse) {
        if (_.isFunction(cacheHandler) && cachedResponse) {
          var places = _.map(cachedResponse.places, function(place) {
            return factory.getCachedSync(place._id) || factory.parseTinyPlace(place);
          });

          cacheHandler(places);
        }
      }).then(function (data) {
        return $q.resolve(_.map(data.places, factory.parsePlace));
      });
    };

    PlaceFactory.prototype.pinPost = function (placeId, postId) {
      var id = placeId + "-" + postId;

      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/pin_post', {
          place_id: placeId,
          post_id: postId
        }).then(function () {
          deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
      }, id);
    };

    PlaceFactory.prototype.unpinPost = function (placeId, postId) {
      var id = placeId + "-" + postId;

      return this.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/unpin_post', {
          place_id: placeId,
          post_id: postId
        }).then(function () {
          deferred.resolve();
        }).catch(deferred.reject);

        return deferred.promise;
      }, id);
    }

    return new PlaceFactory();
  }
})();
