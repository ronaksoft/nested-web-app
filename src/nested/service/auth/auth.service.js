(function() {
  'use strict';

  angular
    .module('nested')
    .constant('AUTH_STATE', {
      UNAUTHORIZED: 'unauthorized',
      AUTHORIZING: 'authorizing',
      AUTHORIZED: 'authorized'
    })
    .constant('AUTH_EVENTS', {
      UNAUTHORIZE: 'unauthorize',
      AUTHORIZE: 'authorize',
      AUTHORIZE_FAIL: 'authorize-fail'
    })
    .constant('UNREGISTER_REASON', {
      LOGOUT: 'logout',
      AUTH_FAIL: 'authorization_fail',
      DISCONNECT: 'disconnect'
    })
    .service('AuthService', NestedAuthService);

  /** @ngInject */
  function NestedAuthService($cookies, $window, $q, $log,
                             WS_EVENTS, WS_RESPONSE_STATUS, WS_ERROR, UNREGISTER_REASON, AUTH_EVENTS, AUTH_STATE,
                             WsService,
                             NestedUser) {
    function AuthService(user) {
      this.user = new NestedUser(user);
      this.state = AUTH_STATE.UNAUTHORIZED;
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.remember = false;
      this.listeners = {};

      if (WsService.isInitialized()) {
        this.reconnect();
      }

      WsService.addEventListener(WS_EVENTS.INITIALIZE, this.reconnect.bind(this));
      WsService.addEventListener(WS_EVENTS.UNINITIALIZE, function () {
        if (this.isAuthorized()) {
          this.unregister(UNREGISTER_REASON.DISCONNECT);
        }
      }.bind(this));
    }

    AuthService.prototype = {
      authorize: function (data) {
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
        this.user.setData(data.info);

        this.state = AUTH_STATE.AUTHORIZED;
        this.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTHORIZE, { detail: { user: this.user } }));

        return $q(function (res) {
          res(this.user);
        }.bind(this));
      },

      register: function (username, password) {
        this.state = AUTH_STATE.AUTHORIZING;

        return WsService.request('session/register', { uid: username, pass: password });
      },

      recall: function (sessionKey, sessionSecret) {
        this.state = AUTH_STATE.AUTHORIZING;

        return WsService.request('session/recall', { _sk: sessionKey, _ss: sessionSecret });
      },

      unregister: function (reason) {
        var result = $q(function (res) {
          res(reason);
        });

        switch (reason) {
          case UNREGISTER_REASON.DISCONNECT:
            break;

          default:
            this.lastSessionKey = null;
            this.lastSessionSecret = null;
            $cookies.remove('nss');
            $cookies.remove('nsk');
            result = WsService.request('session/close').then(function () {
              WsService.unauthorize();

              return $q(function (res) {
                res(reason);
              });
            });
            break;
        }

        this.state = AUTH_STATE.UNAUTHORIZED;
        this.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZE, { detail: { reason: reason } }));

        return result;
      },

      login: function (credentials, remember) {
        this.remember = remember;

        return this.register(credentials.username, credentials.password).then(
          this.authorize.bind(this)
        ).catch(function (data) {
          this.unregister(UNREGISTER_REASON.AUTH_FAIL);
          this.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTHORIZE_FAIL, { detail: { reason: data.err_code } }));

          return $q(function (res, rej) {
            rej.apply(null, this.input);
          }.bind({ input: arguments }));
        }.bind(this));
      },

      reconnect: function () {
        this.lastSessionKey = $cookies.get('nsk') || this.lastSessionKey;
        this.lastSessionSecret = $cookies.get('nss') || this.lastSessionSecret;

        // TODO: Read from an storage
        this.remember = true;

        if (this.lastSessionKey && this.lastSessionSecret) {
          return this.recall(this.lastSessionKey, this.lastSessionSecret).then(
            this.authorize.bind(this)
          ).catch(function (data) {
            switch (data.err_code) {
              case WS_ERROR.DUPLICATE:
                return $q(function (res) {
                  res({
                    status: WS_RESPONSE_STATUS.SUCCESS,
                    info: this.user,
                    _sk : {
                      $oid: this.lastSessionKey
                    },
                    _ss: this.lastSessionSecret
                  });
                }.bind(this)).then(this.authorize.bind(this));
                break;

              case WS_ERROR.ACCESS_DENIED:
              case WS_ERROR.INVALID:
                this.unregister(UNREGISTER_REASON.AUTH_FAIL);
                this.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTHORIZE_FAIL, { detail: { reason: data.err_code } }));

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
            status: WS_RESPONSE_STATUS.ERROR,
            err_code: WS_ERROR.INVALID
          });
        })
      },

      logout: function () {
        return this.unregister(UNREGISTER_REASON.LOGOUT).then(function () {
          // Post logout job

          return $q(function (res) {
            res.apply(null, this.input);
          }.bind({ input: arguments }));
        }.bind(this));
      },

      getState: function () {
        return this.state;
      },

      isAuthorized: function () {
        return AUTH_STATE.AUTHORIZED == this.getState();
      },

      isInAuthorization: function () {
        return this.isAuthorized() ||
          AUTH_STATE.AUTHORIZATION == this.getState() ||
          $cookies.get('nsk') ||
          this.lastSessionKey;
      },

      isUnauthorized: function () {
        return AUTH_STATE.UNAUTHORIZED == this.getState();
      },

      haveAccess: function (placeId, permissions) {
        permissions = angular.isArray(permissions) ? permissions : [permissions];

        // TODO: Get from UserPlaceAccessFactory
      },

      addEventListener: function (type, callback, oneTime) {
        if (!(type in this.listeners)) {
          this.listeners[type] = [];
        }

        this.listeners[type].push({
          flush: oneTime || false,
          fn: callback
        });
      },

      removeEventListener: function (type, callback) {
        if (!(type in this.listeners)) {
          return;
        }

        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
          if (stack[i].fn === callback) {
            stack.splice(i, 1);

            return this.removeEventListener(type, callback);
          }
        }
      },

      dispatchEvent: function (event) {
        if (!(event.type in this.listeners)) {
          return;
        }

        var stack = this.listeners[event.type];
        // event.target = this;
        var flushTank = [];
        for (var i = 0, l = stack.length; i < l; i++) {
          stack[i].fn.call(this, event);
          stack[i].flush && flushTank.push(stack[i]);
        }

        for (var key in flushTank) {
          this.removeEventListener(event.type, flushTank[key].fn);
        }
      }
    };

    // Cache Implementation
    var user = $window.sessionStorage.getItem('nsu');
    var service = new AuthService(user ? angular.fromJson(user) : undefined);
    service.addEventListener(AUTH_EVENTS.AUTHENTICATE, function (event) {
      $window.sessionStorage.setItem('nsu', angular.toJson(event.detail.user));
    });
    service.addEventListener(AUTH_EVENTS.UNAUTHENTICATE, function () {
      $window.sessionStorage.clear();
    });

    return service;
  }

})();
