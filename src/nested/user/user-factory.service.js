(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q, md5,
                             NstSvcServer, NstSvcTinyUserStorage, NstSvcUserStorage,
                             NST_USER_FACTORY_EVENT,
                             NstObservableObject, NstFactoryQuery, NstFactoryError, NstTinyUser, NstUser, NstPicture, NstFactoryEventData) {
    function UserFactory() {
      this.requests = {
        get: {},
        getTiny: {},
        remove: {},
        removePicture : {},
        updatePicture : {}
      };
    }

    UserFactory.prototype = new NstObservableObject();
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

      if (!this.requests.get[id]) {
        var query = new NstFactoryQuery(id);

        // FIXME: Check whether if request should be removed on resolve/reject
        this.requests.get[id] = $q(function (resolve, reject) {
          var user = NstSvcUserStorage.get(query.id);
          if (user && !force) {
            resolve(user);
          } else {
            var requestData = {};
            if (id !== 'me') {
              requestData.account_id = query.id;
            }
            NstSvcServer.request('account/get_info', requestData).then(function (userData) {
              var user = factory.parseUser(userData.info);
              NstSvcUserStorage.set(query.id, user);
              resolve(user);
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
     * Retrieves a user by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    UserFactory.prototype.getTiny = function (id) {
      var factory = this;

      if (!this.requests.getTiny[id]) {
        var query = new NstFactoryQuery(id);

        // FIXME: Check whether if request should be removed on resolve/reject
        this.requests.getTiny[id] = $q(function (resolve, reject) {
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
        factory.set(user);
        factory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, new NstFactoryEventData(user)));
        deferred.resolve(user);
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
      });

      return deferred.promise;
    }

    UserFactory.prototype.changePassword = function (oldPassword, newPassword) {
      var deferred = $q.defer();
      var factory = this;

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

    UserFactory.prototype.save = function (user) {
      var factory = this;

      // TODO: Enqueue requests

      if (user.isNew()) {
        var params = {
          account_id: user.getId()
        };

        var query = new NstFactoryQuery(user.getId(), params);

        return NstSvcServer.request('account/add', params).then(function (data) {
          var newUser = factory.parseUser(data.account);

          return $q(function (res) {
            res(NstSvcUserFactory.set(newUser).get(newUser.getId()).save());
          });
        }).catch(function (error) {
          return $q(function (res, rej) {
            rej(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });
      } else {
        var deferred = $q.defer();

        // TODO: Add Phone Number, Country
        var params = {
          fname: user.getFirstName(),
          lname: user.getLastName(),
          dob : user.getDateOfBirth(),
          gender : user.getGender()
        };

        var query = new NstFactoryQuery(user.getId(), params);

        var promises = [
          NstSvcServer.request('account/update', params)
        ];

        if (user.getPicture().getId()) {
          promises.push(factory.updatePicture(user.getPicture().getId()));
        } else {
          promises.push(factory.removePicture());
        }

        // TODO: Set account picture
        $q.all(promises).then(function () {
          // TODO: Dispatch event
          user.save();
          factory.set(user);

          deferred.resolve(user);
        }).catch(function (error) {
          deferred.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
        });

        return deferred.promise;
      }
    };

    UserFactory.prototype.updatePicture = function (uid) {
      var deferred = $q.defer();
      var factory = this;

      NstSvcServer.request('account/set_picture', { universal_id : uid }).then(function (result) {
        factory.get(null, true).then(function (user) {
          factory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PICTURE_UPDATED, new NstFactoryEventData(user)));
          deferred.resolve(uid);
        }).catch(deferred.reject);
      }).catch(function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
    };

    UserFactory.prototype.removePicture = function () {
      var deferred = $q.defer();
      var factory = this;
      NstSvcServer.request('account/remove_picture').then(function (result) {
        factory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PICTURE_REMOVED, new NstFactoryEventData()));
        deferred.resolve();
      }).catch(function (error) {
        deferred.reject(new NstFactoryError(new NstFactoryQuery(), error.getMessage(), error.getCode(), error));
      });
      return deferred.promise;
    };

    UserFactory.prototype.remove = function (id) {
      if (!this.requests.remove[id]) {
        var query = new NstFactoryQuery(id);

        this.requests.remove[id] = $q(function(resolve, reject) {
          // if (!NstSvcAuth.haveAccess(query.id, [NST_USER_ACCESS.REMOVE])) {
          //   reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
          // }

          NstSvcServer.request('account/remove', {
            account_id: query.id
          }).then(function () {
            NstSvcUserStorage.remove(query.id);
            NstSvcTinyUserStorage.remove(query.id);
          }).catch(function (error) {
            return $q(function (res, rej) {
              rej(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          });
        });
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

    UserFactory.prototype.parseTinyUser = function (userData) {
      var user = new NstTinyUser();

      if (!angular.isObject(userData)) {
        return user;
      }

      user.setNew(false);
      user.setId(userData._id);
      user.setFirstName(userData.fname);
      user.setLastName(userData.lname);

      if (angular.isObject(userData.picture)) {
        user.setPicture(userData.picture);
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

      if (angular.isObject(userData.picture)) {
        user.setPicture(userData.picture);
      }

      return user;
    };

    UserFactory.prototype.toUserData = function (user) {
      var userData = {
        _id: user.getId(),
        fname: user.getFirstName(),
        lname: user.getLastName(),
        phone: user.getPhone(),
        country: user.getCountry(),
        picture: {
          org: user.getPicture().getOrg().getId()
        }
      };

      var thumbs = user.getPicture().getThumbnails();
      for (var size in thumbs) {
        userData.picture[size] = thumbs[size].getId();
      }

      return userData;
    };

    UserFactory.prototype.createUserModel = function (model) {
      return new NstUser(model);
    };

    UserFactory.prototype.search = function (settings) {
      var factory = this;
      var defer = $q.defer();

      var defaultSettings = {
        query : '' ,
        placeId : null,
        limit : 10,
        role : null
      };

      settings = _.defaults(settings, defaultSettings);
      NstSvcServer.request('account/search', {
        keyword: settings.query,
        place_id: settings.placeId,
        role: settings.role,
        limit: settings.limit
      }).then(function (data) {
        var users = _.map(data.accounts, factory.parseTinyUser);
        defer.resolve(users);
      }).catch(defer.reject);

      return defer.promise;
    };

    UserFactory.prototype.getMentions = function (skip, limit) {
      var defer = $q.defer();

      NstSvcServer.request('account/get_mentions', {
        skip : skip || 0,
        limit : limit || 12
      }).then(function (data) {
        
        defer.resolve(data.mentions);
      }).catch(defer.reject);

      return defer.promise;
    }

    return new UserFactory();
  }
})();
