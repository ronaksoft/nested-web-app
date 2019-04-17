(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcUserFactory', NstSvcUserFactory);

  function NstSvcUserFactory($q, md5, _, $rootScope, NST_AUTH_EVENT,
                             NstSvcServer, NstSvcGlobalCache, $timeout,
                             NST_USER_SEARCH_AREA, NST_USER_EVENT, NST_SRV_ERROR,
                             NstBaseFactory, NstTinyUser, NstUser, NstUserAuthority, NstPicture, NstPlace, NstCollector) {
    function UserFactory() {
      this.cache = NstSvcGlobalCache.createProvider('user');
      this.collector = new NstCollector('account', this.getMany);
    }

    UserFactory.prototype = new NstBaseFactory();
    UserFactory.prototype.constructor = UserFactory;
    UserFactory.prototype.currentUser = '_current';
    /**
     * Retrieves a user by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    UserFactory.prototype.get = function (id, ignore) {
      var factory = this;
      // first ask the cache provider to give the model
      var deferred = $q.defer();

      var cachedUser = this.getCachedSync(id);
      var withServer = true;
      if (cachedUser && ignore !== true) {
        withServer = false;
        deferred.resolve(cachedUser);
      }

      if (ignore === true) {
        factory.cache.remove(id);
      }

      // collects all requests for account and send them all using getMany
      this.collector.add(id).then(function (data) {
        // update cache database
        factory.set(data);
        if (withServer) {
          deferred.resolve(factory.parseTinyUser(data, true));
        }
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            if (withServer) {
              deferred.reject();
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
    };

    /**
     * Retrieves a user by id and store in the related cache storage
     *
     * @param {String} id
     *
     * @returns {Promise}
     */
    UserFactory.prototype.getCached = function (id) {
      var factory = this;
      var deferred = $q.defer();

      var cachedUser = this.getCachedSync(id);
      if (cachedUser) {
        deferred.resolve(cachedUser);
        return deferred.promise;
      }

      this.collector.add(id).then(function (data) {
        factory.set(data);
        deferred.resolve(factory.parseTinyUser(data, true));
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
    };

    /**
     * Returns the current user account. First uses cache storage and the asks Cyrus if the account was not found
     *
     * @param {any} ignore
     * @returns
     */
    UserFactory.prototype.getCurrent = function (ignore) {
      var factory = this;
      var current = factory.getCurrentCachedSync();
      if (current && ignore !== true) {
        return $q.resolve(current);
      }

      if (ignore) {
        factory.cache.remove(current);
      }

      return this.sentinel.watch(function () {
        return NstSvcServer.request('account/get', {}).then(function (account) {
          factory.currentUser = account._id || account.id;
          factory.cache.set(factory.currentUser, account);
          if (account.flags.force_password_change) {
            $timeout(function () {
              $rootScope.$broadcast(NST_AUTH_EVENT.CHANGE_PASSWORD);
            }, 100);
          }
          return $q.resolve(factory.parseUser(account));
        });
      }, 'getCurrent');
    };

    UserFactory.prototype.getCurrentCachedSync = function () {
      if (this.currentUser === '_current') {
        return;
      }
      var current = this.cache.get(this.currentUser);
      if (!current) {
        return;
      }

      return this.parseUser(current);
    };

    UserFactory.prototype.setCurrent = function (user) {
      if (this.currentUser === '_current') {
        this.currentUser = user._id || user.id;
      }
      this.cache.set(this.currentUser, user, {
        expiration: new Date().setFullYear(new Date().getFullYear() + 1)
      });
    };

    UserFactory.prototype.removeCurrent = function () {
      this.cache.remove(this.currentUser);
    };

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
        // console.error('The data is not valid to be cached!', data);
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
        "privacy": "privacy"
      };

      var keyValues = _.mapKeys(params, function (value, key) {
        return propertiesMap[key] || key;
      });

      NstSvcServer.request('account/update', keyValues).then(function () {
        return service.get(id, true);
      }).then(function (user) {
        $rootScope.$broadcast(NST_USER_EVENT.PROFILE_UPDATED, {userId: user.id, user: user});
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
          $rootScope.$broadcast(NST_USER_EVENT.PICTURE_UPDATED, {userId: user, user: user});
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
          $rootScope.$broadcast(NST_USER_EVENT.PICTURE_REMOVED, {userId: user.id, user: user});
          deferred.resolve(user);
        }).catch(deferred.reject);

        return deferred.promise;
      }, "removePicture");
    }

    UserFactory.prototype.parseTinyUser = function (data, dontSetCache) {
      if (!_.isObject(data)) {
        throw Error("Could not create a user model with an invalid data");
      }

      if (!data._id) {
        throw Error("Could not parse user data without _id");
      }

      if (dontSetCache !== true) {
        this.set(data);
      }

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
      userAuthority.admin = data.admin;

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

      if (data.mail) {
        user.mail = {
          host: data.mail.outgoing_smtp_host,
          port: data.mail.outgoing_smtp_port,
          username: data.mail.outgoing_smtp_user,
          status: data.mail.active,
        };
      }

      if (_.isObject(data.counters)) {
        user.totalNotificationsCount = data.counters.total_mentions;
        user.unreadNotificationsCount = data.counters.unread_mentions;
      }

      if (data.picture && data.picture.org) {
        user.picture = new NstPicture(data.picture);
      }

      return user;
    };

    var whiteSpaceRegEx = /\s/;

    function moveExactToViewPort(users, keyword) {
      if (_.isString(keyword) && keyword.length > 0 && !whiteSpaceRegEx.test(keyword)) {
        var index = _.findIndex(users, {'_id': keyword});
        var item = {};
        if (index === -1) {
          item = {
            _id: keyword,
            name: keyword,
            description: '',
            place: null,
            access: []
          };
          if (users.length > 5) {
            users.splice(4, 0, item);
          } else {
            users.push(item);
          }
        } else if (index >= 5) {
          item = users[index];
          users.splice(index, 0);
          users.splice(4, 0, item);
        }
      }
    }

    /**
     * @property stopGenerateFromQuery it defined because some times we dont need to generating automatically
     * an user from query (it used by compose for composing to invisible peoples)
     */
    UserFactory.prototype.search = function (settings, area, stopGenerateFromQuery) {

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

      if (settings.taskId) {
        params.task_id = settings.taskId;
      }

      settings = _.defaults(settings, defaultSettings);
      return this.sentinel.watch(function () {
        NstSvcServer.request('search/accounts' + area, params).then(function (data) {

          // If the results is zero search in another way
          if ((area === NST_USER_SEARCH_AREA.ACCOUNTS || area === NST_USER_SEARCH_AREA.INVITE) && data.accounts.length === 0) {
            NstSvcServer.request('search/accounts', params).then(function (data) {
              if (!stopGenerateFromQuery) {
                moveExactToViewPort(data.accounts, params.keyword);
              }
              var users = _.map(data.accounts, function (account) {
                return factory.parseTinyUser(account);
              });
              defer.resolve(users);
            }).catch(defer.reject);
          } else {
            if (area === NST_USER_SEARCH_AREA.ACCOUNTS && !stopGenerateFromQuery) {
              moveExactToViewPort(data.accounts, params.keyword);
            }
            var users = _.map(data.accounts, function (account) {
              return factory.parseTinyUser(account);
            });
            defer.resolve(users);
          }
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

    UserFactory.prototype.trustEmail = function (email, trustDomain) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('account/trust_email', {
          email_addr: email,
          domain: trustDomain
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

    UserFactory.prototype.updateEmail = function (params) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('account/update_email', params);
      }, 'untrustEmail');
    }

    UserFactory.prototype.removeEmail = function () {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('account/remove_email', {});
      }, 'untrustEmail');
    }

    return new UserFactory();
  }
})();
