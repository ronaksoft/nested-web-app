(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcAuth', NstSvcAuth);

  /** @ngInject */
  function NstSvcAuth($cookies, $window, $q, $log,
                      NST_SRV_EVENT, NST_SRV_RESPONSE_STATUS, NST_SRV_ERROR, NST_UNREGISTER_REASON, NST_AUTH_EVENTS, NST_AUTH_STATE,
                      NstSvcServer,
                      NstObservableObject, NstUser) {
    function Auth(user) {
      // TODO: Let user factory create this
      this.user = new NstUser(user);
      this.state = NST_AUTH_STATE.UNAUTHORIZED;
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.remember = false;
      this.listeners = {};

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
      $log.debug('Authorization', data);

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

      // TODO: Pass to user service
      this.user.fill(data.info);

      this.state = NST_AUTH_STATE.AUTHORIZED;
      this.dispatchEvent(new CustomEvent(NST_AUTH_EVENTS.AUTHORIZE, { detail: { user: this.user } }));

      return $q(function (res) {
        res(this.user);
      }.bind(this));
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
      this.dispatchEvent(new CustomEvent(NST_AUTH_EVENTS.UNAUTHORIZE, { detail: { reason: reason } }));

      return result;
    };

    Auth.prototype.login = function (credentials, remember) {
      this.remember = remember;

      return this.register(credentials.username, credentials.password).then(
        this.authorize.bind(this)
      ).catch(function (data) {
        this.unregister(NST_UNREGISTER_REASON.AUTH_FAIL);
        this.dispatchEvent(new CustomEvent(NST_AUTH_EVENTS.AUTHORIZE_FAIL, { detail: { reason: data.err_code } }));

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
        ).catch(function (data) {
          switch (data.err_code) {
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
              this.dispatchEvent(new CustomEvent(NST_AUTH_EVENTS.AUTHORIZE_FAIL, { detail: { reason: data.err_code } }));

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
      return this.unregister(NST_UNREGISTER_REASON.LOGOUT).then(function () {
        // Post logout job

        return $q(function (res) {
          res.apply(null, this.input);
        }.bind({ input: arguments }));
      }.bind(this));
    };

    Auth.prototype.getState = function () {
      return this.state;
    };

    Auth.prototype.isAuthorized = function () {
      return NST_AUTH_STATE.AUTHORIZED == this.getState();
    };

    Auth.prototype.isInAuthorization = function () {
      return this.isAuthorized() ||
        NST_AUTH_STATE.AUTHORIZATION == this.getState() ||
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
    var user = $window.sessionStorage.getItem('nsu');
    var service = new Auth(user ? angular.fromJson(user) : undefined);
    service.addEventListener(NST_AUTH_EVENTS.AUTHENTICATE, function (event) {
      $window.sessionStorage.setItem('nsu', angular.toJson(event.detail.user));
    });
    service.addEventListener(NST_AUTH_EVENTS.UNAUTHENTICATE, function () {
      $window.sessionStorage.clear();
    });

    return service;
  }

})();
