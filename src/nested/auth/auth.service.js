(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcAuth', NstSvcAuth);

  /** @ngInject */
  function NstSvcAuth($cookies, $q, $log,
                      NST_SRV_EVENT, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_UNREGISTER_REASON, NST_AUTH_EVENT, NST_AUTH_STATE,
                      NstSvcServer, NstSvcUserFactory, NstSvcAuthStorage,
                      NstObservableObject) {
    function Auth(userData) {
      var service = this;
      var user = NstSvcUserFactory.parseUser(userData);
      if (user.getId()) {
        NstSvcUserFactory.set(user).get(user.getId()).then(function (user) {
          service.user = user;
        });
      }

      this.user = user;
      this.state = NST_AUTH_STATE.UNAUTHORIZED;
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.remember = false;

      NstObservableObject.call(this);

      if (NstSvcServer.isInitialized()) {
        this.reconnect();
      }

      NstSvcServer.addEventListener(NST_SRV_EVENT.INITIALIZE, this.reconnect.bind(this));
      NstSvcServer.addEventListener(NST_SRV_EVENT.UNINITIALIZE, function () {
        if (this.isAuthorized()) {
          this.unregister(NST_UNREGISTER_REASON.DISCONNECT);
        }
      }.bind(this));
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

      this.lastSessionKey = data._sk.$oid;
      this.lastSessionSecret = data._ss;
      $cookies.put('nsk', this.lastSessionKey, options);
      $cookies.put('nss', this.lastSessionSecret, options);

      this.user = NstSvcUserFactory.parseUser(data.info);

      return NstSvcUserFactory.set(this.user).get(this.user.getId()).then(function (user) {
        service.setUser(user);
        service.setState(NST_AUTH_STATE.AUTHORIZED);

        service.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE, { detail: { user: service.user } }));

        var deferred = $q.defer();
        deferred.resolve(service.getUser());

        return deferred.promise;
      });
    };

    Auth.prototype.register = function (username, password) {
      this.state = NST_AUTH_STATE.AUTHORIZING;

      return NstSvcServer.request('session/register', { uid: username, pass: password });
    };

    Auth.prototype.recall = function (sessionKey, sessionSecret) {
      this.state = NST_AUTH_STATE.AUTHORIZING;

      return NstSvcServer.request('session/recall', { _sk: sessionKey, _ss: sessionSecret });
    };

    Auth.prototype.unregister = function (reason) {
      var result = $q(function (res) {
        res(reason);
      });

      switch (reason) {
        case NST_UNREGISTER_REASON.DISCONNECT:
          break;

        default:
          this.lastSessionKey = null;
          this.lastSessionSecret = null;
          $cookies.remove('nss');
          $cookies.remove('nsk');
          result = NstSvcServer.request('session/close').then(function () {
            NstSvcServer.unauthorize();

            return $q(function (res) {
              res(reason);
            });
          });
          break;
      }

      this.state = NST_AUTH_STATE.UNAUTHORIZED;
      this.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.UNAUTHORIZE, { detail: { reason: reason } }));

      return result;
    };

    Auth.prototype.login = function (credentials, remember) {
      this.remember = remember;

      return this.register(credentials.username, credentials.password).then(
        this.authorize.bind(this)
      ).catch(function (error) {
        this.unregister(NST_UNREGISTER_REASON.AUTH_FAIL);
        this.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, { detail: { reason: error } }));

        return $q(function (res, rej) {
          rej.apply(null, this.input);
        }.bind({ input: arguments }));
      }.bind(this));
    };

    Auth.prototype.reconnect = function () {
      this.lastSessionKey = $cookies.get('nsk') || this.lastSessionKey;
      this.lastSessionSecret = $cookies.get('nss') || this.lastSessionSecret;

      // TODO: Read from an storage
      this.remember = true;

      if (this.lastSessionKey && this.lastSessionSecret) {
        return this.recall(this.lastSessionKey, this.lastSessionSecret).then(
          this.authorize.bind(this)
        ).catch(function (error) {
          console.log(error);
          switch (error.getCode()) {
            case NST_SRV_ERROR.DUPLICATE:
              return $q(function (res) {
                res({
                  status: NST_SRV_RESPONSE_STATUS.SUCCESS,
                  info: this.user,
                  _sk : {
                    $oid: this.lastSessionKey
                  },
                  _ss: this.lastSessionSecret
                });
              }.bind(this)).then(this.authorize.bind(this));
              break;

            case NST_SRV_ERROR.ACCESS_DENIED:
            case NST_SRV_ERROR.INVALID:
              this.unregister(NST_UNREGISTER_REASON.AUTH_FAIL);
              this.dispatchEvent(new CustomEvent(NST_AUTH_EVENT.AUTHORIZE_FAIL, { detail: { reason: error } }));

              return $q(function (res, rej) {
                rej.apply(null, this.input);
              }.bind({ input: arguments }));
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

    Auth.prototype.haveAccess = function (placeId, permissions) {
      permissions = angular.isArray(permissions) ? permissions : [permissions];

      // TODO: Get from UserPlaceAccessFactory
    };

    // Cache Implementation
    var user = NstSvcAuthStorage.get('user');
    var service = new Auth(user);
    service.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function (event) {
      NstSvcAuthStorage.set('user', NstSvcUserFactory.toUserData(event.detail.user));
    });
    service.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      NstSvcAuthStorage.remove('user');
    });

    return service;
  }
})();
