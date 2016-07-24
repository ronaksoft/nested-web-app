(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q,
                             NstSvcServer, NstSvcTinyUserStorage, NstSvcUserStorage,
                             NstFactoryQuery, NstFactoryError, NstTinyUser, NstUser) {
    function UserFactory() {
      this.requests = {
        get: {},
        getTiny: {},
        remove: {}
      };
    }

    UserFactory.prototype = {};
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
    UserFactory.prototype.get = function (id) {
      var factory = this;

      if (!this.requests.get[id]) {
        var query = new NstFactoryQuery(id);

        // FIXME: Check whether if request should be removed on resolve/reject
        this.requests.get[id] = $q(function (resolve, reject) {
          var place = NstSvcUserStorage.get(query.id);
          if (place) {
            resolve(place);
          } else {
            NstSvcServer.request('account/get_info', {
              account_id: query.id
            }).then(function (userData) {
              var user = factory.parseUser(userData.info);
              NstSvcUserStorage.set(query.id, user);
              resolve(user);
            }).catch(function(error) {
              // TODO: Handle error by type
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

    UserFactory.prototype.save = function (user) {
      var factory = this;

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
          // TODO: Handle error by type

          return $q(function (res, rej) {
            rej(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });
      } else {
        // TODO: Add phonenumber, country, firstName, lastName
        var params = {
          account_id: user.getId()
        };

        var query = new NstFactoryQuery(user.getId(), params);

        // TODO: Set account picture
        return NstSvcServer.request('account/update', params).then(function () {
          return $q(function (res) {
            res(NstSvcUserFactory.set().get(user.getId()).save());
          });
        }).catch(function (error) {
          // TODO: Handle error by type

          return $q(function (res, rej) {
            rej(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        });
      }
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
            // TODO: Handle error by type
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

    return new UserFactory();
  }
})();
