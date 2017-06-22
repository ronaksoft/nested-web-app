(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q, md5, _, $rootScope,
                             NstSvcServer, NstSvcTinyUserStorage, NstSvcUserStorage, NstPlace,
                             NST_USER_SEARCH_AREA,
                             NST_USER_EVENT,
                             NstBaseFactory, NstFactoryQuery, NstFactoryError, NstTinyUser, NstUser, NstPicture, NstFactoryEventData) {
    function UserFactory() { }

    UserFactory.prototype = new NstBaseFactory();
    UserFactory.prototype.constructor = UserFactory;

    UserFactory.prototype.has = function (id) {
      return !!NstSvcUserStorage.get(id);
    };

    UserFactory.prototype.hasTiny = function (id) {
      return !!NstSvcTinyUserStorage.get(id);
    };

    /**
     * Retrieves a user by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    UserFactory.prototype.get = function (id, force) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var query = new NstFactoryQuery(id);

        return $q(function (resolve, reject) {
          var user = NstSvcUserStorage.get(query.id);
          if (user && !force) {
            resolve(user);
          } else {
            NstSvcServer.request('account/get', {
              'account_id': query.id
            }).then(function (userData) {
              var user = factory.parseUser(userData);
              NstSvcUserStorage.set(query.id, user);
              resolve(user);
            }).catch(function (error) {
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        });
      }, "get", id);

    }

    /**
     * Retrieves a user by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    UserFactory.prototype.getTiny = function (id) {
      if (!id) {
        return $q.reject(Error('Id is not provided'));
        // throw Error('Id is not provided');
      }
      var factory = this;
      return factory.sentinel.watch(function () {
        var query = new NstFactoryQuery(id);

        return $q(function (resolve, reject) {
          var user = NstSvcUserStorage.get(query.id) || NstSvcTinyUserStorage.get(query.id);
          if (user) {
            if (!(user instanceof NstTinyUser)) {
              user = new NstTinyUser(user);
            }

            resolve(user);
          } else {
            factory.get(query.id).then(function (user) {
              user = new NstTinyUser(user);
              NstSvcTinyUserStorage.set(query.id, user);
              resolve(user);
            }).catch(reject);
          }
        });
      }, "getTiny", id);
    }

    UserFactory.prototype.getTinySafe = function (id) {
      var service = this;
      return $q(function (resolve) {
        service.getTiny(id).then(function (place) {
          resolve(place);
        }).catch(function () {
          resolve({id: id});
        });
      });
    };

    UserFactory.prototype.set = function (user) {
      if (user instanceof NstUser) {
        if (this.has(user.id)) {
          NstSvcUserStorage.merge(user.id, user);
        } else {
          NstSvcUserStorage.set(user.id, user);
        }
      } else if (user instanceof NstTinyUser) {
        if (this.hasTiny(user.id)) {
          NstSvcTinyUserStorage.merge(user.id, user);
        } else {
          NstSvcTinyUserStorage.set(user.id, user);
        }
      }

      return this;
    };

    UserFactory.prototype.update = function (id, params) {
      var service = this;

      var deferred = $q.defer();
      var propertiesMap = {
        "firstName": "fname",
        "lastName": "lname",
        "dateOfBirth": "dob",
        "gender": "gender",
        "privacy" : "privacy"
      };

      var keyValues = _.mapKeys(params, function (value, key) {
        return propertiesMap[key] || key;
      });

      NstSvcServer.request('account/update', keyValues).then(function () {
        return service.get(id, true);
      }).then(function (user) {
        $rootScope.$broadcast(NST_USER_EVENT.PROFILE_UPDATED, { userId: user.id, user : user});
        deferred.resolve(user);
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(null, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    };

    UserFactory.prototype.changePassword = function (oldPassword, newPassword) {

      var deferred = $q.defer();

      var query = new NstFactoryQuery(null, {
        oldPassword: oldPassword,
        newPassword: newPassword
      });

      NstSvcServer.request('account/set_password', {
        old_pass: md5.createHash(oldPassword),
        new_pass: md5.createHash(newPassword)
      }).then(function () {
        deferred.resolve();
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    }

    UserFactory.prototype.updatePicture = function (userId, uid) {
      var factory = this;

      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('account/set_picture', {
          universal_id: uid
        }).then(function () {

          return factory.get(userId, true);
        }).then(function (user) {
          $rootScope.$broadcast(NST_USER_EVENT.PICTURE_UPDATED, { userId: user, user: user });
          deferred.resolve(user);
        }).catch(function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, "updatePicture");
    };

    UserFactory.prototype.removePicture = function (userId) {
      var factory = this;

      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('account/remove_picture').then(function () {

          return factory.get(userId, true);
        }).then(function (user) {
          $rootScope.$broadcast(NST_USER_EVENT.PICTURE_REMOVED, { userId: user.id, user: user });
          deferred.resolve(user);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(new NstFactoryQuery(), error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "removePicture");
    }

    UserFactory.prototype.getRecentlyVisitedPlace = function () {

      var deferred = $q.defer();

      function parsePlace(placeData) {
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


      NstSvcServer.request('account/GET_RECENTLY_VISITED_PLACES', {}).then(function (data) {
        var places = _.map(data.places, parsePlace);
        deferred.resolve(places);
      }).catch(function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    UserFactory.prototype.parseTinyUser = function (data) {
      if (!_.isObject(data)) {
        throw Error("Could not create a user model with an invalid data");
      }

      if (!data._id) {
        throw Error("Could not parse user data without _id");
      }

      var user = new NstTinyUser();

      user.id = data._id;
      user.firstName = data.fname ? data.fname : data.name ? data.name : data._id;
      user.lastName = data.lname || '';
      user.fullName = user.getFullName();

      if (data.picture && data.picture.org) {
        user.picture = new NstPicture(data.picture);
      }

      this.set(user);

      return user;
    };

    UserFactory.prototype.parseUser = function (userData) {
      var user = new NstUser();

      if (!angular.isObject(userData)) {
        return user;
      }
      user.admin = userData.admin ? true : false;
      user.id = userData._id;
      user.firstName = userData.fname ? userData.fname : userData.name ? userData.name : userData._id;
      user.lastName = userData.lname || '';
      user.fullName = user.getFullName();
      user.phone = userData.phone;
      user.limits = userData.limits;
      user.country = userData.country;
      user.dateOfBirth = userData.dob;
      user.gender = userData.gender;
      user.email = userData.email;
      user.privacy = userData.privacy;

      if (_.isObject(userData.counters)) {
        user.totalNotificationsCount = userData.counters.total_mentions;
        user.unreadNotificationsCount = userData.counters.unread_mentions;
      }

      if (userData.picture && userData.picture.org) {
        user.picture = new NstPicture(userData.picture);
      }

      return user;
    };

    UserFactory.prototype.search = function (settings, area) {

      if (area === undefined) {
        throw "Define search area";
      }

      var factory = this;
      var defer = $q.defer();

      var defaultSettings = {
        query: '',
        placeId: null,
        limit: 10,
        role: null
      };

      var params = {
        keyword: settings.query,
        role: settings.role,
        limit: settings.limit
      };

      if (area === NST_USER_SEARCH_AREA.ADD) {
        if (!settings.placeId) {
          throw "Define place id for search in users";
        }
      }

      if (settings.placeId) {
        params.place_id = settings.placeId;
      }

      if (area === NST_USER_SEARCH_AREA.MENTION) {
        if (!settings.postId) {
          throw "Define post id for search in post users";
        }
        params.post_id = settings.postId;
      }

      settings = _.defaults(settings, defaultSettings);
      NstSvcServer.request('search/accounts' + area, params).then(function (data) {
        var users = _.map(data.accounts, function (account) {
          return factory.parseTinyUser(account);
        });
        defer.resolve(users);
      }).catch(defer.reject);

      return defer.promise;
    };

    return new UserFactory();
  }
})();
