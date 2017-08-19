(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcAuth', NstSvcAuth);

  /** @ngInject */
  function NstSvcAuth(_, $cookies, $q, $log, $rootScope,
                      NstSvcServer, NstSvcUserFactory, NstSvcPlaceFactory, NstSvcLogger, NstSvcI18n, NstSvcClient,
                      NstSvcCurrentUserStorage, NstSvcFileStorage, NstSvcInvitationStorage,
                      NstSvcMyPlaceIdStorage,
                      NstSvcPostStorage, NstSvcUploadTokenStorage, NstSvcContactStorage, NstSvcDate,
                      NST_SRV_EVENT, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_UNREGISTER_REASON, NST_CONFIG,
                      NST_AUTH_EVENT, NST_AUTH_STATE, NST_AUTH_STORAGE_KEY,
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
        service.setUser(user);
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
      /* eslint-disable */
      if (window.addEventListener)
        addEventListener('storage', storage_event, false);
      else if (window.attachEvent)
        attachEvent('onstorage', storage_event, false);

      function storage_event(e) {
        if (e.key === USER_STATUS_STORAGE_NAME
          && e.newValue !== e.oldValue
          && (e.newValue === NST_AUTH_STATE.AUTHORIZED || e.newValue === NST_AUTH_STATE.UNAUTHORIZED)) {
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
    Auth.prototype.setLastUserKeys = function (ss, sk) {
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
    Auth.prototype.setAppCookies = function (cookies, remember) {
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
    Auth.prototype.setUserCookie = function (user, remember) {
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
    Auth.prototype.removeUserCookie = function () {
      $cookies.remove('user');
    }


    /**
     * Auth.prototype.removeAppCookies - Remove all the app cookies
     */
    Auth.prototype.removeAppCookies = function () {
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

      NstSvcDate.setServerTime(data.server_timestamp);

      this.setLastUserKeys(data._ss, data._sk);

      this.setAppCookies({
        'nss': this.lastSessionSecret,
        'nsk': this.lastSessionKey,
        'ndid': this.lastDeviceId,
        'ndt': this.lastDeviceToken,
        'nos': 'android'
      }, remember);

      NstSvcUserFactory.set(data.account);
      var user = NstSvcUserFactory.parseUser(data.account);
      this.setUser(user);
      service.setUserCookie(user, remember);
      $rootScope.$broadcast(NST_AUTH_EVENT.AUTHORIZE, { user: user });

      return $q.resolve(user);
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

      this.setLastDeviceToken(NstSvcClient.getDt());
      this.setLastDeviceId(NstSvcClient.getDid());

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
          NstSvcPostStorage.cache.flush();
          NstSvcUploadTokenStorage.cache.flush();
          NstSvcContactStorage.cache.flush();

          service.user = null;

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
        $rootScope.$broadcast(NST_AUTH_EVENT.UNAUTHORIZE, { reason: reason });
        deferred.resolve(response);
      }).catch(deferred.reject);

      return deferred.promise;
    };

    Auth.prototype.setState = function (state) {
      if (this.state === state) return;

      this.state = state;

      if (this.state === NST_AUTH_STATE.AUTHORIZING) return;

      localStorage.setItem(USER_STATUS_STORAGE_NAME, state);
    }

    Auth.prototype.login = function (credentials, remember) {
      var service = this,
        deferred = $q.defer(),
        domain = null,
        id = null;

      if (credentials.username.indexOf('@') > 1) {
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

    Auth.prototype.getRemember = function () {
      return localStorage.getItem(NST_AUTH_STORAGE_KEY.REMEMBER) === 'true';
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

      this.setLastDeviceToken(NstSvcClient.getDt());
      this.setLastDeviceId(NstSvcClient.getDid());

      if (this.getLastSessionKey() && this.getLastSessionSecret()) {
        // TODO: Use Try Service
        this.recall(this.getLastSessionKey(), this.getLastSessionSecret()).then(function (response) {
          service.user = NstSvcUserFactory.parseUser(response.account);
          service.state = NST_AUTH_STATE.AUTHORIZED;

          NstSvcClient.setDt(service.lastDeviceToken);
          NstSvcClient.setDid(service.lastDeviceId);

          service.authorize(response).then(deferred.resolve);
        }).catch(function (error) {
          $log.debug('Auth | Recall Error: ', error);

          switch (error.code) {
            case NST_SRV_ERROR.ACCESS_DENIED:
            case NST_SRV_ERROR.INVALID:
            case NST_SRV_ERROR.UNAUTHORIZED:
            case NST_SRV_ERROR.SESSION_EXPIRE:
              service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL).then(function () {
                $rootScope.$on(NST_AUTH_EVENT.AUTHORIZE_FAIL, { reason: error });
                deferred.reject(error);
              }).catch(deferred.reject);
              break;
            default:
              // TODO: Decide what to do here!!??
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
        }).catch(reject);
      });

    };

    Auth.prototype.terminateSession = function (sk) {
      return $q(function (resolve, reject) {
        NstSvcServer.request('session/close_active', {
          _sk: sk
        }).then(function () {
          resolve();
        }).catch(reject);
      });

    };

    Auth.prototype.setDeviceToken = function (token) {
      var currentToken = NstSvcClient.getDt();
      if (token !== currentToken) {
        this.setLastDeviceToken(token);
        NstSvcClient.setDt(token);
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

    var service = new Auth(NstSvcCurrentUserStorage.get(NST_AUTH_STORAGE_KEY.USER));

    $rootScope.$on(NST_AUTH_EVENT.AUTHORIZE, function (e, data) {
      NstSvcCurrentUserStorage.set(NST_AUTH_STORAGE_KEY.USER, data.user);
    });
    $rootScope.$on(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      NstSvcCurrentUserStorage.remove(NST_AUTH_STORAGE_KEY.USER);
    });


    return service;
  }
})();
