(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q, md5,
                             NstSvcServer, NstSvcTinyUserStorage, NstSvcUserStorage,
                             NST_USER_SEARCH_AREA,
                             NST_USER_FACTORY_EVENT,
                             NstBaseFactory, NstFactoryQuery, NstFactoryError, NstTinyUser, NstUser, NstPicture, NstFactoryEventData) {
    function UserFactory() {

    }

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
      id = id || 'me';

      return factory.sentinel.watch(function () {
        var query = new NstFactoryQuery(id);

        return $q(function (resolve, reject) {
          var user = NstSvcUserStorage.get(query.id);
          if (user && !force) {
            resolve(user);
          } else {
            var requestData = {};
            if (id !== 'me') {
              requestData.account_id = query.id;
            }
            NstSvcServer.request('account/get', requestData).then(function (userData) {
              var user = factory.parseUser(userData);
              NstSvcUserStorage.set(query.id, user);
              resolve(user);
            }).catch(function(error) {
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
    UserFactory.prototype.getTiny = function(id) {
      var factory = this;
      return factory.sentinel.watch(function() {
        var query = new NstFactoryQuery(id);

        return $q(function(resolve, reject) {
          var user = NstSvcUserStorage.get(query.id) || NstSvcTinyUserStorage.get(query.id);
          if (user) {
            if (!(user instanceof NstTinyUser)) {
              user = new NstTinyUser(user);
            }

            resolve(user);
          } else {
            factory.get(query.id).then(function(user) {
              user = new NstTinyUser(user);
              NstSvcTinyUserStorage.set(query.id, user);
              resolve(user);
            }).catch(reject);
          }
        });
      }, "getTiny", id);
    }

    UserFactory.prototype.set = function (user) {
      if (user instanceof NstUser) {
        if (this.has(user.getId())) {
          NstSvcUserStorage.merge(user.getId(), user);
        } else {
          NstSvcUserStorage.set(user.getId(), user);
        }
      } else if (user instanceof NstTinyUser) {
        if (this.hasTiny(user.getId())) {
          NstSvcTinyUserStorage.merge(user.getId(), user);
        } else {
          NstSvcTinyUserStorage.set(user.getId(), user);
        }
      }

      return this;
    };

    UserFactory.prototype.updateProfile = function (user) {
      var deferred = $q.defer();
      var factory = this;

      var params = {
        fname: user.getFirstName(),
        lname: user.getLastName(),
        dob : user.getDateOfBirth(),
        gender : user.getGender()
      };

      var query = new NstFactoryQuery(user.getId(), params);

      NstSvcServer.request('account/update', params).then(function (result) {
        NstSvcUserStorage.set("me", user);
        factory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, new NstFactoryEventData(user)));
        deferred.resolve(user);
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    }

    UserFactory.prototype.changePassword = function (oldPassword, newPassword) {
      var factory = this;
      var deferred = $q.defer();

      var query = new NstFactoryQuery(null, {
        oldPassword : oldPassword,
        newPassword : newPassword
      });

      NstSvcServer.request('account/set_password', {
        old_pass : md5.createHash(oldPassword),
        new_pass : md5.createHash(newPassword)
      }).then(function (result) {
        deferred.resolve();
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    }

    UserFactory.prototype.updatePicture = function(uid) {
      var factory = this;

      return factory.sentinel.watch(function() {
        var deferred = $q.defer();

        NstSvcServer.request('account/set_picture', {
          universal_id: uid
        }).then(function(result) {
          console.log('response', result);
          factory.get(null, true).then(function(user) {
            factory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PICTURE_UPDATED, new NstFactoryEventData(user)));
            deferred.resolve(uid);
          }).catch(deferred.reject);
        }).catch(function(error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, "updatePicture");
    }

    UserFactory.prototype.removePicture = function () {
      var factory = this;

      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('account/remove_picture').then(function (result) {
          factory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PICTURE_REMOVED, new NstFactoryEventData()));
          deferred.resolve();
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(new NstFactoryQuery(), error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }, "removePicture");
    }

    UserFactory.prototype.parseTinyUser = function (data) {
      if (!_.isObject(data)) {
        throw Error("Could not create a user model with an invalid data");
      }

      if (!data._id) {
        throw Error("Could not parse user data without _id");
      }

      var user = new NstTinyUser();

      user.setId(data._id);
      user.setFirstName(data.fname);
      user.setLastName(data.lname);

      if (data.picture && data.picture.org) {
        user.setPicture(new NstPicture(data.picture));
      }

      return user;
    };

    UserFactory.prototype.parseUser = function (userData) {
      var user = new NstUser();

      if (!angular.isObject(userData)) {
        return user;
      }

      user.setNew(false);
      user.setId(userData._id);
      user.setFirstName(userData.fname);
      user.setLastName(userData.lname);
      user.setPhone(userData.phone);
      user.setCountry(userData.country);
      user.setDateOfBirth(userData.dob);
      user.setGender(userData.gender);

      if (_.isObject(userData.counters)) {
        user.setTotalMentionsCount(userData.counters.total_mentions);
        user.setUnreadMentionsCount(userData.counters.unread_mentions);
      }

      if (userData.picture && userData.picture.org) {
        user.picture = new NstPicture(userData.picture);
      }

      return user;
    };

    UserFactory.prototype.toUserData = function (user) {
      var userData = {
        _id: user.getId(),
        fname: user.getFirstName(),
        lname: user.getLastName(),
        phone: user.getPhone(),
        country: user.getCountry()
      };

      if (user.hasPicture()) {
        userData.picture = {
          org: user.picture.original,
          x32 : user.picture.x32,
          x64 : user.picture.x64,
          x128 : user.picture.x128,
          pre : user.picture.preview
        };
      }

      return userData;
    };

    UserFactory.prototype.createUserModel = function (model) {
      return new NstUser(model);
    };

    UserFactory.prototype.search = function (settings, area) {

      if (area === undefined){
        throw "Define search area";
      }

      var factory = this;
      var defer = $q.defer();

      var defaultSettings = {
        query : '' ,
        placeId : null,
        limit : 10,
        role : null
      };

      var params = {
        keyword: settings.query,
        role: settings.role,
        limit: settings.limit
      };

      if(area === NST_USER_SEARCH_AREA.ADD ||
        area === NST_USER_SEARCH_AREA.INVITE){
        if (!settings.placeId){
          throw "Define place id for search in users";
        }
      }

      if(settings.placeId){
        params.place_id = settings.placeId;
      }

      if(area === NST_USER_SEARCH_AREA.MENTION){
        if (!settings.postId){
          throw "Define post id for search in post users";
        }
        params.post_id = settings.postId;
      }

      settings = _.defaults(settings, defaultSettings);
      NstSvcServer.request('search/accounts' + area, params).then(function (data) {
        var users = _.map(data.accounts, factory.parseTinyUser);
        defer.resolve(users);
      }).catch(defer.reject);

      return defer.promise;
    };

    return new UserFactory();
  }
})();
