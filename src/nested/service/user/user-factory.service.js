(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q,
                             NST_SRV_ERROR, NST_USER_ACCESS,
                             NstSvcAuth, NstSvcServer, NstSvcTinyUserStorage, NstSvcUserStorage,
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
            }).then(function (placeData) {
              var user = factory.parseUser(placeData.info);
              NstSvcUserStorage.set(query.id, user);
              resolve(user);
            }).catch(function(error) {
              // TODO: Handle error by type
              reject(new NstFactoryError(query, error.message, error.err_code));
            });
          }
        });
      }

      return this.requests.get[id];
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

      return this.requests.getTiny[id];
    };

    UserFactory.prototype.set = function (user) {
      if (user instanceof NstUser) {
        if (this.has(user.getId())) {
          user = this.get(user.getId()).merge(user);
        }

        NstSvcUserStorage.set(user.getId(), user);
      } else if (user instanceof NstTinyUser) {
        if (this.hasTiny(user.getId())) {
          user = this.getTiny(user.getId()).merge(user);
        }

        NstSvcTinyUserStorage.set(user.getId(), user);
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
            rej(new NstFactoryError(query, error.message, error.err_code))
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
            rej(new NstFactoryError(query, error.message, error.err_code))
          });
        });
      }
    };

    UserFactory.prototype.remove = function (id) {
      if (!this.requests.remove[id]) {
        var query = new NstFactoryQuery(id);

        this.requests.remove[id] = $q(function(resolve, reject) {
          if (!NstSvcAuth.haveAccess(query.id, [NST_USER_ACCESS.REMOVE])) {
            reject(new NstFactoryError(query, 'Access Denied', NST_SRV_ERROR.ACCESS_DENIED));
          }

          NstSvcServer.request('account/remove', {
            account_id: query.id
          }).then(function () {
            NstSvcUserStorage.remove(query.id);
            NstSvcTinyUserStorage.remove(query.id);
          }).catch(function (error) {
            // TODO: Handle error by type
            reject(new NstFactoryError(query, error.message, error.err_code));
          });
        });
      }

      return this.requests.remove[id];
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

    UserFactory.prototype.parseUser = function (placeData) {
      var user = new NstUser();

      if (!angular.isObject(placeData)) {
        return user;
      }

      user.setNew(false);
      user.setId(placeData._id);
      user.setFirstName(userData.fname);
      user.setLastName(userData.lname);
      user.setPhone(userData.phone);
      user.setCountry(userData.country);

      if (angular.isObject(placeData.picture)) {
        user.setPicture(placeData.picture);
      }

      return user;
    };

    return new UserFactory();
  }
})();
