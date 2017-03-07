(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcAuth', NstSvcAuth);

  /** @ngInject */
  function NstSvcAuth($cookies, $q, $log,
                      NstSvcServer, NstSvcUserFactory, NstSvcAuthStorage, NstSvcPlaceFactory, NstSvcLogger, NstSvcUserStorage, NstSvcI18n,
                      NST_SRV_EVENT, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_UNREGISTER_REASON, NST_AUTH_EVENT, NST_AUTH_STATE, NST_AUTH_STORAGE_KEY, NST_OBJECT_EVENT,
                      NstObservableObject) {

    var USER_STATUS_STORAGE_NAME = 'nested.user_status';

    function Auth(userData) {
      var service = this;
      var user = NstSvcUserFactory.parseUser(userData);

      this.user = user;
      this.state = NST_AUTH_STATE.UNAUTHORIZED;
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.lastDeviceId = null;
      this.lastDeviceToken = null;
      this.lastOs = getBrowser();
      this.remember = NstSvcAuthStorage.get(NST_AUTH_STORAGE_KEY.REMEMBER) || false;

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

      this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
        switch (event.detail.name) {
          case 'remember':
            NstSvcAuthStorage.set(NST_AUTH_STORAGE_KEY.REMEMBER, event.detail.newValue);
            break;
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

    Auth.prototype.authorize = function (data) {
      var service = this;
      var deferred = $q.defer();
      NstSvcLogger.debug2('Auth | Authorization', data);

      var options = {};
      var expires = new Date();
      // if (this.remember) {
      expires.setFullYear(expires.getFullYear() + 1);
      // }
      options['expires'] = expires;

      this.setLastSessionKey(data._sk);
      this.setLastSessionSecret(data._ss);
      // this.setLastDeviceId(data._ss);

      // this.setLastSessionSecret(data._ss);

      $cookies.put('nsk', this.lastSessionKey, options);
      $cookies.put('nss', this.lastSessionSecret, options);
      $cookies.put('nos', getBrowser(), options);
      $cookies.put('ndid', this.lastDeviceId, options);
      $cookies.put('ndt', this.lastDeviceToken, options);

      this.setUser(NstSvcUserFactory.parseUser(data.account));
      NstSvcUserFactory.set(this.getUser());

      NstSvcUserFactory.get(this.getUser().id).then(function (user) {
        service.setUser(user);

        var CookieDate = new Date;
        CookieDate.setFullYear(CookieDate.getFullYear() + 1);
        $cookies.put('user', JSON.stringify({
          id: user.id,
          name: user.fullName,
          avatar: user.picture ? user.picture.getUrl('x64') : ""
        }), {
          domain: 'nested.me', //FIXME:: set domain form location
          expires: CookieDate.toGMTString()
        });
        service.setState(NST_AUTH_STATE.AUTHORIZED);

        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE, {detail: {user: service.getUser()}}));
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
        _os: this.getLastOs()
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
        _os: this.getLastOs()
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
          this.setLastSessionKey(null);
          this.setLastSessionSecret(null);
          $cookies.remove('ndid');
          $cookies.remove('ndt');
          $cookies.remove('nos');
          $cookies.remove('nss');
          $cookies.remove('nsk');
          $cookies.remove('user');
          qUnauth.resolve(reason);
          break;

        default:
          NstSvcAuthStorage.cache.flush();
          NstSvcUserStorage.cache.flush();
          localStorage.clear();

          if (localStorage.getItem(USER_STATUS_STORAGE_NAME) !== NST_AUTH_STATE.UNAUTHORIZED)
            localStorage.setItem(USER_STATUS_STORAGE_NAME, NST_AUTH_STATE.UNAUTHORIZED);

          this.setLastSessionKey(null);
          this.setLastSessionSecret(null);
          $cookies.remove('ndid');
          $cookies.remove('ndt');
          $cookies.remove('nos');
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
        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.UNAUTHORIZE, {detail: {reason: reason}}));
        deferred.resolve(response);
      }).catch(deferred.reject);

      return deferred.promise;
    };

    Auth.prototype.login = function (credentials, remember) {
      var service = this;
      var deferred = $q.defer();
      this.setRemember(remember);

      this.register(credentials.username, credentials.password).then(function (response) {
        localStorage.setItem(USER_STATUS_STORAGE_NAME, NST_AUTH_STATE.AUTHORIZED);
        service.authorize(response).then(deferred.resolve);
      }).catch(function (error) {
        service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL).then(function () {
          deferred.reject(error);
          service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, {detail: {reason: error}}));
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

          if (localStorage.getItem(USER_STATUS_STORAGE_NAME) !== NST_AUTH_STATE.AUTHORIZED)
            localStorage.setItem(USER_STATUS_STORAGE_NAME, NST_AUTH_STATE.AUTHORIZED);

          service.authorize(response).then(deferred.resolve);
        }).catch(function (error) {
          $log.debug('Auth | Recall Error: ', error);
          switch (error.getCode()) {
            case NST_SRV_ERROR.DUPLICATE:
              service.authorize({
                status: NST_SRV_RESPONSE_STATUS.SUCCESS,
                info: service.getUser(),
                _sk: {
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
                service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, {detail: {reason: error}}));
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


    Auth.prototype.setDeviceToken = function (token) {
      if (token !== $cookies.get('ndt')) {
        this.setLastDeviceToken(token);
        $cookies.put('ndt', token);
        this.reconnect();
      }
    };

    function getBrowser() {
      var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
      }
      if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
      if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
      return  "android"//M[0].toLowerCase();
    }

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
      NstSvcAuthStorage.set(NST_AUTH_STORAGE_KEY.USER, NstSvcUserFactory.toUserData(event.detail.user));
    });
    service.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      NstSvcAuthStorage.remove(NST_AUTH_STORAGE_KEY.USER);
    });

    return service;
  }
})();
