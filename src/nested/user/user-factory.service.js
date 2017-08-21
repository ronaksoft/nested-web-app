(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q, md5, _, $rootScope,
                             NstSvcServer, NstSvcCacheProvider,
                             NST_USER_SEARCH_AREA, NST_USER_EVENT,
                             NstBaseFactory, NstTinyUser, NstUser, NstUserAuthority, NstPicture, NstPlace, NstCollector) {
    function UserFactory() { 
      this.cache = new NstSvcCacheProvider('user');
      this.collector = new NstCollector('account', this.getMany);
    }

    UserFactory.prototype = new NstBaseFactory();
    UserFactory.prototype.constructor = UserFactory;

    /**
     * Retrieves a user by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    UserFactory.prototype.get = function (id) {
      var factory = this;
      // first ask the cache provider to give the model
      var cachedUser = this.getCachedSync(id);
      if (cachedUser) {
        return $q.resolve(cachedUser);
      }

      var deferred = $q.defer();
      // collects all requests for account and send them all using getMany
      this.collector.add(id).then(function (data) {
        // update cache database
        factory.set(data);
        deferred.resolve(factory.parseTinyUser(data));
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            deferred.reject();
            factory.cache.remove(id);
            break;

          default:
            deferred.reject(error);
            break;
        }
      });

      return deferred.promise;
    }


    /**
     * Returns the account of current user. This always asks Cyrus and does not use any cache storage
     * 
     * @param {any} id 
     * @returns 
     */
    UserFactory.prototype.getCurrent = function (id) {
      var factory = this;
      return NstSvcServer.request('account/get', {}).then(function (account) {
        return $q.resolve(factory.parseUser(account));
      });
    }



    UserFactory.prototype.getMany = function (id) {
      var joinedIds = id.join(',');
      return NstSvcServer.request('account/get_many', {
        account_id: joinedIds
      }).then(function (data) {
        return $q.resolve({
          idKey: '_id',
          resolves: data.accounts,
          rejects: data.no_access
        });
      });
    };

    UserFactory.prototype.getCachedSync = function (id) {
      var model = this.cache.get(id);
      if (!model) {
        return null;
      }

      return this.parseCachedModel(model);
    }

    UserFactory.prototype.getSafe = function (id) {
      var service = this;
      return $q(function (resolve) {
        service.get(id).then(function (place) {
          resolve(place);
        }).catch(function () {
          resolve({id: id});
        });
      });
    };

    UserFactory.prototype.set = function (data) {
      if (data && data._id) {
        this.cache.set(data._id, this.transformToCacheModel(data));
      } else {
        console.error('The data is not valid to be cached!', data);
      }
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
      }).catch(deferred.reject);

      return deferred.promise;
    };

    UserFactory.prototype.changePassword = function (oldPassword, newPassword) {
      return NstSvcServer.request('account/set_password', {
        old_pass: md5.createHash(oldPassword),
        new_pass: md5.createHash(newPassword)
      });
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
        }).catch(deferred.reject);

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
      }


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

      this.set(data);

      var user = new NstTinyUser();

      user.id = data._id;
      user.firstName = data.fname ? data.fname : data.name ? data.name : data._id;
      user.lastName = data.lname || '';
      user.fullName = user.getFullName();

      if (data.picture && data.picture.org) {
        user.picture = new NstPicture(data.picture);
      }

      return user;
    };

    UserFactory.prototype.parseUserAuthority = function (data) {
      var userAuthority = new NstUserAuthority();
      if (!angular.isObject(data)) {
        return userAuthority;
      }

      userAuthority.labelEditor = data.label_editor;

      return userAuthority;
    };

    UserFactory.prototype.parseCachedModel = function (data) {
      if (!data) {
        return null;
      }

      return this.parseTinyUser(data);
    }

    UserFactory.prototype.transformToCacheModel = function (user) {
      return user;
    }

    UserFactory.prototype.parseUser = function (data) {
      if (!_.isObject(data)) {
        throw Error("Could not create a user model with an invalid data");
      }

      if (!data._id) {
        throw Error("Could not parse user data without _id");
      }

      this.set(data);
      var user = new NstUser();

      user.admin = data.admin ? true : false;
      user.labelEditor = data.label_editor ? true : false;
      user.id = data._id;
      user.firstName = data.fname ? data.fname : data.name ? data.name : data._id;
      user.lastName = data.lname || '';
      user.fullName = user.getFullName();
      user.phone = data.phone;
      user.limits = data.limits;
      user.country = data.country;
      user.dateOfBirth = data.dob;
      user.gender = data.gender;
      user.email = data.email;
      user.privacy = data.privacy;
      user.authority = this.parseUserAuthority(data.authority);

      if (_.isObject(data.counters)) {
        user.totalNotificationsCount = data.counters.total_mentions;
        user.unreadNotificationsCount = data.counters.unread_mentions;
      }

      if (data.picture && data.picture.org) {
        user.picture = new NstPicture(data.picture);
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
      return this.sentinel.watch(function () {
        NstSvcServer.request('search/accounts' + area, params).then(function (data) {
          var users = _.map(data.accounts, function (account) {
            return factory.parseTinyUser(account);
          });
          defer.resolve(users);
        }).catch(defer.reject);
        return defer.promise;
      }, 'search/accounts' + area + params.keyword);
    };

    UserFactory.prototype.changePhone = function (phone, verificationId, password) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('account/change_phone', {
          phone: phone,
          vid: verificationId,
          pass: password
        });
      }, 'changePhone');

    }

    UserFactory.prototype.trustEmail = function (email) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('account/trust_email', {
          email_addr: email
        });
      }, 'trustEmail');
    }

    UserFactory.prototype.untrustEmail = function (email) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('account/untrust_email', {
          email_addr: email
        });
      }, 'untrustEmail');
    }


    return new UserFactory();
  }
})();
