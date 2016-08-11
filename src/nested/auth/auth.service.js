(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcAuth', NstSvcAuth);

  /** @ngInject */
  function NstSvcAuth($cookies, $q, $log,
                      NST_SRV_EVENT, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_UNREGISTER_REASON, NST_AUTH_EVENT, NST_AUTH_STATE, NST_AUTH_STORAGE_KEY, NST_OBJECT_EVENT,
                      NstSvcServer, NstSvcUserFactory, NstSvcPlaceFactory, NstSvcAuthStorage,
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
      $log.debug('Auth | Authorization', data);

      var options = {};
      if (this.remember) {
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        options['expires'] = expires;
      }

      this.setLastSessionKey(data._sk.$oid);
      this.setLastSessionSecret(data._ss);
      $cookies.put('nsk', this.lastSessionKey, options);
      $cookies.put('nss', this.lastSessionSecret, options);

      this.setUser(NstSvcUserFactory.parseUser(data.info));

      return NstSvcUserFactory.set(this.getUser()).get(this.getUser().getId()).then(function (user) {
        service.setUser(user);
        service.setState(NST_AUTH_STATE.AUTHORIZED);

        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE, { detail: { user: service.getUser() } }));

        var deferred = $q.defer();
        deferred.resolve(service.getUser());

        return deferred.promise;
      });
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

      switch (reason) {
        case NST_UNREGISTER_REASON.DISCONNECT:
          deferred.resolve(reason);
          break;

        case NST_UNREGISTER_REASON.AUTH_FAIL:
          this.setLastSessionKey(null);
          this.setLastSessionSecret(null);
          $cookies.remove('nss');
          $cookies.remove('nsk');
          deferred.resolve(reason);
          break;

        default:
          this.setLastSessionKey(null);
          this.setLastSessionSecret(null);
          $cookies.remove('nss');
          $cookies.remove('nsk');
          NstSvcServer.request('session/close').then(function () {
            NstSvcServer.unauthorize();
            deferred.resolve(reason);
          }).catch(deferred.reject);
          break;
      }

      return deferred.promise.then(function (response) {
        service.setState(NST_AUTH_STATE.UNAUTHORIZED);
        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.UNAUTHORIZE, { detail: { reason: reason } }));

        return $q(function (res) {
          res(response);
        });
      });
    };

    Auth.prototype.login = function (credentials, remember) {
      var service = this;
      this.setRemember(remember);

      return this.register(credentials.username, credentials.password).then(
        this.authorize.bind(this)
      ).catch(function (error) {
        service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL);
        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, { detail: { reason: error } }));

        return $q(function (res, rej) {
          rej(error);
        });
      });
    };

    Auth.prototype.reconnect = function () {
      var service = this;

      if ($cookies.get('nsk')) {
        this.setLastSessionKey($cookies.get('nsk'));
      }

      if ($cookies.get('nss')) {
        this.setLastSessionSecret($cookies.get('nss'));
      }

      if (this.getLastSessionKey() && this.getLastSessionSecret()) {
        // TODO: Use Try Service
        return this.recall(this.getLastSessionKey(), this.getLastSessionSecret()).then(
          this.authorize.bind(this)
        ).catch(function (error) {
          $log.debug('Auth | Recall Error: ', error);
          switch (error.getCode()) {
            case NST_SRV_ERROR.DUPLICATE:
              return $q(function (res) {
                res({
                  status: NST_SRV_RESPONSE_STATUS.SUCCESS,
                  info: service.getUser(),
                  _sk : {
                    $oid: service.getLastSessionKey()
                  },
                  _ss: service.getLastSessionSecret()
                });
              }).then(this.authorize.bind(this));
              break;

            case NST_SRV_ERROR.ACCESS_DENIED:
            case NST_SRV_ERROR.INVALID:
              service.unregister(NST_UNREGISTER_REASON.AUTH_FAIL);
              service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, { detail: { reason: error } }));

              return $q(function (res, rej) {
                rej(error);
              });
              break;

            default:
              // Try to reconnect
              return this.reconnect();
              break;
          }
        }.bind(this));
      }

      return $q(function (res, rej) {
        rej({
          status: NST_SRV_RESPONSE_STATUS.ERROR,
          err_code: NST_SRV_ERROR.INVALID
        });
      })
    };

    Auth.prototype.logout = function () {
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

    Auth.prototype.getRole = function (placeId, forceRequest) {
      return NstSvcPlaceFactory.getRoleOnPlace(placeId, forceRequest);
    };

    Auth.prototype.getAccess = function (placeId, forceRequest) {
      return NstSvcPlaceFactory.getAccessOnPlace(placeId, forceRequest);
    };

    Auth.prototype.hasAccess = function (placeId, qAccess, forceRequest) {
      return NstSvcPlaceFactory.hasAccess(placeId, qAccess, forceRequest);
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
