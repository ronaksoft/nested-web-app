(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcAuth', NstSvcAuth);

  /** @ngInject */
  function NstSvcAuth($cookies, $q, $log,
    NstSvcServer, NstSvcUserFactory, NstSvcAuthStorage, NstSvcPlaceFactory, NstSvcStore, NstSvcUserStorage, NstSvcI18n,
    NST_SRV_EVENT, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_UNREGISTER_REASON, NST_AUTH_EVENT, NST_AUTH_STATE, NST_AUTH_STORAGE_KEY, NST_OBJECT_EVENT, NST_STORE_ROUTE,
    NstObservableObject) {
    function Auth(userData) {
      var service = this;
      var user = NstSvcUserFactory.parseUser(userData);

      this.user = user;
      this.state = NST_AUTH_STATE.UNAUTHORIZED;
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.remember = NstSvcAuthStorage.get(NST_AUTH_STORAGE_KEY.REMEMBER) || false;

      NstObservableObject.call(this);

      if (user.getId()) {
        NstSvcUserFactory.set(user).get(user.getId()).then(function (user) {
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

      this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
        switch (event.detail.name) {
          case 'remember':
            NstSvcAuthStorage.set(NST_AUTH_STORAGE_KEY.REMEMBER, event.detail.newValue);
            break;
        }
      });
    }

    Auth.prototype = new NstObservableObject();
    Auth.prototype.constructor = Auth;

    Auth.prototype.authorize = function (data) {
      var service = this;
      var deferred = $q.defer();
      $log.debug('Auth | Authorization', data);

      var options = {};
      if (this.remember) {
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        options['expires'] = expires;
      }

      this.setLastSessionKey(data._sk);
      this.setLastSessionSecret(data._ss);
      $cookies.put('nsk', this.lastSessionKey, options);
      $cookies.put('nss', this.lastSessionSecret, options);

      this.setUser(NstSvcUserFactory.parseUser(data.account));
      NstSvcUserFactory.set(this.getUser());

      NstSvcUserFactory.get(this.getUser().getId()).then(function (user) {
        service.setUser(user);
        var CookieDate = new Date;
        CookieDate.setFullYear(CookieDate.getFullYear() +1);
        $cookies.put('user', JSON.stringify({
          id : user.id,
          name : user.fullName,
          // avatar : user.picture.thumbnails.x128.url.view
        }), {
          domain : '.' + location.hostname,
          expires : CookieDate.toGMTString()
        });
        service.setState(NST_AUTH_STATE.AUTHORIZED);

        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE, { detail: { user: service.getUser() } }));
        deferred.resolve(service.getUser());
      }).catch(deferred.reject);

      return deferred.promise;
    };

    Auth.prototype.register = function (username, password) {
      this.setState(NST_AUTH_STATE.AUTHORIZING);

      return NstSvcServer.request('session/register', { uid: username, pass: password });
    };

    Auth.prototype.recall = function (sessionKey, sessionSecret) {
      this.setState(NST_AUTH_STATE.AUTHORIZING);

      return NstSvcServer.request('session/recall', { _sk: sessionKey, _ss: sessionSecret });
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
          this.setLastSessionKey(null);
          this.setLastSessionSecret(null);
          $cookies.remove('nss');
          $cookies.remove('nsk');
          $cookies.remove('user');
          qUnauth.resolve(reason);
          break;

        default:
          NstSvcAuthStorage.cache.flush();
          NstSvcUserStorage.cache.flush();
          localStorage.clear();
          this.setLastSessionKey(null);
          this.setLastSessionSecret(null);
          $cookies.remove('nss');
          $cookies.remove('nsk');
          $cookies.remove('user');
          NstSvcServer.request('session/close').then(function () {
            NstSvcServer.unauthorize();
          }).catch(qUnauth.reject);
          qUnauth.resolve(reason);
          break;
      }

      qUnauth.promise.then(function (response) {
        service.setState(NST_AUTH_STATE.UNAUTHORIZED);
        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.UNAUTHORIZE, { detail: { reason: reason } }));
        deferred.resolve(response);
      }).catch(deferred.reject);

      return deferred.promise;
    };

    Auth.prototype.login = function (credentials, remember) {
      var service = this;
      var deferred = $q.defer();
      this.setRemember(remember);

      this.register(credentials.username, credentials.password).then(function (response) {
        service.authorize(response).then(deferred.resolve);
      }).catch(function (error) {
        service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL).then(function () {
          deferred.reject(error);
          service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, { detail: { reason: error } }));
        });
      });

      return deferred.promise;
    };

    Auth.prototype.reconnect = function () {
      var service = this;
      var deferred = $q.defer();

      if ($cookies.get('nsk')) {
        this.setLastSessionKey($cookies.get('nsk'));
      }

      if ($cookies.get('nss')) {
        this.setLastSessionSecret($cookies.get('nss'));
      }

      if (this.getLastSessionKey() && this.getLastSessionSecret()) {
        // TODO: Use Try Service
        this.recall(this.getLastSessionKey(), this.getLastSessionSecret()).then(function (response) {
          service.user = NstSvcUserFactory.parseUser(response.account);
          service.authorize(response).then(deferred.resolve);
        }).catch(function (error) {
          $log.debug('Auth | Recall Error: ', error);
          switch (error.getCode()) {
            case NST_SRV_ERROR.DUPLICATE:
              service.authorize({
                status: NST_SRV_RESPONSE_STATUS.SUCCESS,
                info: service.getUser(),
                _sk : {
                  $oid: service.getLastSessionKey()
                },
                _ss: service.getLastSessionSecret()
              }).then(deferred.resolve).catch(deferred.reject);
              break;

            case NST_SRV_ERROR.ACCESS_DENIED:
            case NST_SRV_ERROR.INVALID:
            case NST_SRV_ERROR.UNAUTHORIZED:
              service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL).then(function () {
                deferred.reject(error);
                service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, { detail: { reason: error } }));
              }).catch(deferred.reject);
              break;

            default:
              // Try to reconnect
              // service.reconnect().then(deferred.resolve).catch(deferred.reject);
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

    // Cache Implementation
    var user = NstSvcAuthStorage.get(NST_AUTH_STORAGE_KEY.USER);
    var service = new Auth(user);
    service.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function (event) {
      NstSvcAuthStorage.set(NST_AUTH_STORAGE_KEY.USER, NstSvcUserFactory.toUserData(event.detail.user));
    });
    service.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      NstSvcAuthStorage.remove(NST_AUTH_STORAGE_KEY.USER);
    });

    return service;
  }
})();
