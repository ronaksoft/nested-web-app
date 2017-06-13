(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcAuth', NstSvcAuth);

  /** @ngInject */
  function NstSvcAuth(_, $cookies, $q, $log, $rootScope,
                      NstSvcServer, NstSvcUserFactory, NstSvcPlaceFactory, NstSvcLogger, NstSvcI18n,
                      NstSvcUserStorage, NstSvcCurrentUserStorage, NstSvcFileStorage, NstSvcInvitationStorage, NstFactoryError,
                      NstSvcMyPlaceIdStorage, NstSvcPlaceRoleStorage, NstSvcPlaceStorage, NstSvcTinyPlaceStorage,
                      NstSvcPostStorage, NstSvcUploadTokenStorage, NstSvcTinyUserStorage, NstSvcContactStorage,
                      NST_SRV_EVENT, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_UNREGISTER_REASON, NST_CONFIG,
                      NST_AUTH_EVENT, NST_AUTH_STATE, NST_AUTH_STORAGE_KEY, NST_OBJECT_EVENT,
                      NstObservableObject) {

    var USER_STATUS_STORAGE_NAME = 'nested.user_status';

    function Auth(user) {
      var service = this;

      this.user = user;
      this.state = NST_AUTH_STATE.UNAUTHORIZED;
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.lastDeviceId = null;
      this.lastDeviceToken = null;

      NstObservableObject.call(this);

      if (user.id) {
        NstSvcUserFactory.set(user).get(user.id).then(function (user) {
          service.setUser(user);
        });
      }

      if (NstSvcServer.isInitialized()) {
        this.reconnect();
      }

      NstSvcServer.addEventListener(NST_SRV_EVENT.INITIALIZE, this.reconnect.bind(this));
      NstSvcServer.addEventListener(NST_SRV_EVENT.UNINITIALIZE, function () {
        if (service.isAuthorized()) {
          service.unregister(NST_UNREGISTER_REASON.DISCONNECT);
        }
      });

      //Config local storage events
      if (window.addEventListener)
        addEventListener('storage', storage_event, false);
      else if (window.attachEvent)
        attachEvent('onstorage', storage_event, false);
      function storage_event(e) {
        if (e.key === USER_STATUS_STORAGE_NAME) {
          location.reload();
        }
      }


    }

    Auth.prototype = new NstObservableObject();
    Auth.prototype.constructor = Auth;


    /**
     * setLastUserKeys - Set sk (session key) and ss (session secret) of last authorized user
     *
     * @param  {String} ss session secret
     * @param  {String} sk session key
     */
    Auth.prototype.setLastUserKeys = function(ss, sk) {
      this.lastSessionKey = sk;
      this.lastSessionSecret = ss;
    }


    /**
     * setAppCookies - Set the application cookies. Iterates over the enumerable
     *                 string keyed properties and sets a cookie
     *                 using the property name and value
     *
     * @param  {Object}   cookies     An object that contains all app cookies.
     * @param  {boolean}  remember    Make cookies persistant if you set remember = true,
     *                                  else they will be stored as session variables
     *                                  that expires when you close the browser.
     */
    Auth.prototype.setAppCookies = function(cookies, remember) {
      var cookieOptions = {};
      var persist = remember || this.getRemember();
      if (persist) {
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        cookieOptions['expires'] = expires;
      }

      _.forIn(cookies, function (value, key) {
        $cookies.put(key, value, cookieOptions);
      });
    }


    /**
     * Auth.prototype.setUserCookie - Set the authorized user cookie
     *
     * @param  {NstTinyUser} user       Authorize user
     * @param  {boolean}     remember   Make cookies persistant if you set remember to true,
     *                                  else they will be stored as session variables
     *                                  that expires when you close the browser.
     */
    Auth.prototype.setUserCookie = function(user, remember) {
      // FIXME:: set domain form location
      var cookieOptions = {
        'domain': NST_CONFIG.DOMAIN
      };

      var persist = remember || this.getRemember();
      if (persist) {
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        cookieOptions['expires'] = expires;
      }

      $cookies.put('user', JSON.stringify({
        id: user.id,
        name: user.fullName,
        avatar: user.picture ? user.picture.getUrl('x64') : ''
      }), cookieOptions);
    }


    /**
     * Auth.prototype.removeUserCookie - Remove the authenticated user cookie
     */
    Auth.prototype.removeUserCookie = function() {
      $cookies.remove('user');
    }


    /**
     * Auth.prototype.removeAppCookies - Remove all the app cookies
     */
    Auth.prototype.removeAppCookies = function() {
      $cookies.remove('nss');
      $cookies.remove('nsk');
      $cookies.remove('ndid');
      $cookies.remove('ndt');
      $cookies.remove('nos');
    }

    Auth.prototype.authorize = function (data, remember) {

      var service = this;
      var deferred = $q.defer();
      NstSvcLogger.debug2('Auth | Authorization', data);

      this.setLastUserKeys(data._ss, data._sk);

      this.removeAppCookies();
      this.setAppCookies({
        'nss': this.lastSessionSecret,
        'nsk': this.lastSessionKey,
        'ndid': this.lastDeviceId,
        'ndt': this.lastDeviceToken,
        'nos': 'android'
      }, remember);

      this.setUser(NstSvcUserFactory.parseUser(data.account));
      NstSvcUserFactory.set(this.getUser());

      // TODO: Not sure about using UserFactory like this!
      NstSvcUserFactory.get(this.getUser().id).then(function (user) {
        service.setUser(user);
        NstSvcUserFactory.currentUser = user;

        service.removeUserCookie();
        service.setUserCookie(user, remember);

        service.setState(NST_AUTH_STATE.AUTHORIZED);
        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE, {detail: {user: user}}));

        deferred.resolve(service.getUser());
      }).catch(deferred.reject);

      return deferred.promise;
    };

    Auth.prototype.register = function (username, password) {
      this.setState(NST_AUTH_STATE.AUTHORIZING);

      var payload = {
        uid: username,
        pass: password,
        _did: this.getLastDeviceId(),
        _dt: this.getLastDeviceToken(),
        _os: 'android'
      };

      return NstSvcServer.request('session/register', payload);
    };

    Auth.prototype.recall = function (sessionKey, sessionSecret) {
      this.setState(NST_AUTH_STATE.AUTHORIZING);


      if ($cookies.get('ndt')) {
        this.setLastDeviceToken($cookies.get('ndt'));
      }

      //set device id
      if ($cookies.get('ndid')) {
        this.setLastDeviceId($cookies.get('ndid'));
      } else {
        var did = generateDeviceId();
        this.setLastDeviceId(did);
        $cookies.put('ndid', did);
      }


      var payload = {
        _sk: sessionKey,
        _ss: sessionSecret,
        _did: this.getLastDeviceId(),
        _dt: this.getLastDeviceToken(),
        _os: 'android'
      };


      return NstSvcServer.request('session/recall', payload);
    };

    Auth.prototype.unregister = function (reason) {
      var service = this;
      var deferred = $q.defer();
      var qUnauth = $q.defer();

      switch (reason) {
        case NST_UNREGISTER_REASON.DISCONNECT:
          qUnauth.resolve(reason);
          break;

        case NST_UNREGISTER_REASON.AUTH_FAIL:
          this.setLastUserKeys(null, null);
          this.removeAppCookies();
          this.removeUserCookie();
          qUnauth.resolve(reason);
          break;

        default:
          NstSvcCurrentUserStorage.cache.flush();
          NstSvcFileStorage.cache.flush();
          NstSvcInvitationStorage.cache.flush();
          NstSvcMyPlaceIdStorage.cache.flush();
          NstSvcPlaceRoleStorage.cache.flush();
          NstSvcPlaceStorage.cache.flush();
          NstSvcTinyPlaceStorage.cache.flush();
          NstSvcPostStorage.cache.flush();
          NstSvcUploadTokenStorage.cache.flush();
          NstSvcTinyUserStorage.cache.flush();
          NstSvcUserStorage.cache.flush();
          NstSvcContactStorage.cache.flush();

          service.user = null;
          NstSvcUserFactory.currentUser = null;

          localStorage.clear();

          this.setState(NST_AUTH_STATE.UNAUTHORIZED);

          this.setLastUserKeys(null, null);
          this.removeAppCookies();
          this.removeUserCookie();

          NstSvcServer.request('session/close').then(function () {
            NstSvcServer.unauthorize();
          }).catch(function () {
            NstSvcServer.unauthorize();
          });
          qUnauth.resolve(reason);
          break;
      }

      qUnauth.promise.then(function (response) {
        service.setState(NST_AUTH_STATE.UNAUTHORIZED);
        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.UNAUTHORIZE, {detail: {reason: reason}}));
        deferred.resolve(response);
      }).catch(deferred.reject);

      return deferred.promise;
    };

    Auth.prototype.setState = function (state, reason) {
      this.state = state;
      localStorage.setItem(USER_STATUS_STORAGE_NAME, state);
    }

    Auth.prototype.login = function (credentials, remember) {
      var service = this,
          deferred = $q.defer(),
          domain = null,
          id = null;

      if (credentials.username.indexOf('@') > 1){
        id = credentials.username.split('@')[0]
        domain = credentials.username.split('@')[1];
      } else {
        id = credentials.username;
      }

        NstSvcServer.reinit(domain)
          .then(function () {
            service.register(id, credentials.password).then(function (response) {
              service.setState(NST_AUTH_STATE.AUTHORIZED);
              service.setRemember(remember);
              service.authorize(response).then(deferred.resolve);
            }).catch(function (error) {
              service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL).then(function () {
                deferred.reject(error);
              });
            });
          })
          .catch(function (error) {
            deferred.reject(error);
          });

      return deferred.promise;
    };

    Auth.prototype.setRemember = function (value) {
      localStorage.setItem(NST_AUTH_STORAGE_KEY.REMEMBER, value);
    }

    Auth.prototype.getRemember = function (value) {
      return localStorage.getItem(NST_AUTH_STORAGE_KEY.REMEMBER, value) === 'true';
    }

    Auth.prototype.reconnect = function () {
      var service = this;
      var deferred = $q.defer();

      if ($cookies.get('nsk')) {
        this.setLastSessionKey($cookies.get('nsk'));
      }

      if ($cookies.get('nss')) {
        this.setLastSessionSecret($cookies.get('nss'));
      }


      if ($cookies.get('ndt')) {
        this.setLastDeviceToken($cookies.get('ndt'));
      }

      //set device id
      if ($cookies.get('ndid')) {
        this.setLastDeviceId($cookies.get('ndid'));
      } else {
        var did = generateDeviceId();
        this.setLastDeviceId(did);
        $cookies.put('ndid', did);
      }


      if (this.getLastSessionKey() && this.getLastSessionSecret()) {
        // TODO: Use Try Service
        this.recall(this.getLastSessionKey(), this.getLastSessionSecret()).then(function (response) {
          service.user = NstSvcUserFactory.parseUser(response.account);

          service.setState(NST_AUTH_STATE.AUTHORIZED);

          service.authorize(response).then(deferred.resolve);
        }).catch(function (error) {
          $log.debug('Auth | Recall Error: ', error);

          switch (error.getCode()) {
            case NST_SRV_ERROR.ACCESS_DENIED:
            case NST_SRV_ERROR.INVALID:
            case NST_SRV_ERROR.UNAUTHORIZED:
              service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL).then(function () {
                service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, {detail: {reason: error}}));
                deferred.reject(error);
              }).catch(deferred.reject);
              break;
            default:
              break;
          }

        });
      } else {
        deferred.reject({
          status: NST_SRV_RESPONSE_STATUS.ERROR,
          err_code: NST_SRV_ERROR.INVALID
        });
      }

      return deferred.promise;
    };

    Auth.prototype.logout = function () {
      NstSvcPlaceFactory.flush();
      NstSvcI18n.clearSavedLocale();
      $rootScope.$emit('unseen-activity-clear');

      return this.unregister(NST_UNREGISTER_REASON.LOGOUT);
    };

    Auth.prototype.isAuthorized = function () {
      return NST_AUTH_STATE.AUTHORIZED == this.getState();
    };

    Auth.prototype.isInAuthorization = function () {
      return this.isAuthorized() ||
        NST_AUTH_STATE.AUTHORIZING == this.getState() ||
        $cookies.get('nsk') ||
        this.lastSessionKey;
    };

    Auth.prototype.isUnauthorized = function () {
      return NST_AUTH_STATE.UNAUTHORIZED == this.getState();
    };

    Auth.prototype.setUser = function (user) {
      this.user = user
    };

    /**
     * Get user all sessions
     *
     *
     * @returns {Promise}
     */
    Auth.prototype.getSessions = function () {
      var factory = this;
      return $q(function (resolve, reject) {
        NstSvcServer.request('session/get_actives', {}).then(function (userSessions) {
          resolve(_.map(userSessions.sessions, factory.parseSession.bind(factory)));
        }).catch(function (error) {
          reject(new NstFactoryError({}, error.getMessage(), error.getCode(), error));
        });
      });

    };

    Auth.prototype.terminateSession = function (sk) {
      return $q(function (resolve, reject) {
        NstSvcServer.request('session/close_active', {
          _sk: sk
        }).then(function () {
          resolve();
        }).catch(function (error) {
          reject(new NstFactoryError({_sk: sk}, error.getMessage(), error.getCode(), error));
        });
      });

    };

    Auth.prototype.setDeviceToken = function (token) {
      if (token !== $cookies.get('ndt')) {
        this.setLastDeviceToken(token);
        $cookies.put('ndt', token);
        this.reconnect();
      }
    };


    Auth.prototype.parseSession = function (session) {

      var sessionObj = {};

      sessionObj.ip = session.creation_ip.split(":")[0];
      sessionObj.platform = session._cid.split("_")[0];
      sessionObj.device = session._cid.split("_")[1];
      sessionObj.browser = session._cid.split("_")[2];
      sessionObj.os = session._cid.split("_")[3];
      sessionObj.sk = session._sk;
      sessionObj.version = session._cver ? session._cver.toString().split('').join('.') : '';
      sessionObj.date = session.last_access;
      sessionObj.isCurrent = session._sk === this.lastSessionKey;

      return (sessionObj);

    };

    function generateDeviceId() {
      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }

      return "web_" + Date.now() + "-" + guid() + "-" + guid();
    }

    var service = new Auth(NstSvcUserFactory.currentUser);

    service.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function (event) {
      NstSvcCurrentUserStorage.set(NST_AUTH_STORAGE_KEY.USER, event.detail.user);
    });
    service.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      NstSvcCurrentUserStorage.remove(NST_AUTH_STORAGE_KEY.USER);
    });


    return service;
  }
})();
