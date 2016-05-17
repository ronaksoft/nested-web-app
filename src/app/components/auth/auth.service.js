(function() {
  'use strict';

  angular
    .module('nested')
    .constant('AUTH_EVENTS', {
      AUTHENTICATE: 'authenticated',
      AUTHENTICATE_FAIL: 'authentication-failed',
      UNAUTHENTICATE: 'unauthenticated',

      SESSION_TIMEOUT: 'auth-session-timeout',
      NOT_AUTHENTICATED: 'auth-not-authenticated',
      NOT_AUTHORIZED: 'auth-not-authorized'
    })
    .service('AuthService', NestedAuthService);

  /** @ngInject */
  function NestedAuthService($cookies, $window, $q, WsService, WS_EVENTS, AUTH_EVENTS, NestedUser, $log) {
    function AuthService(user) {
      this.user = new NestedUser(user);
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.remember = false;
      this.listeners = {};

      if (WsService.isInitialized()) {
        this.reauth();
      }

      WsService.addEventListener(WS_EVENTS.ERROR, this.unauthorize.bind(this));
      WsService.addEventListener(WS_EVENTS.INITIALIZE, this.reauth.bind(this));
    }

    AuthService.prototype = {
      authorize: function (data) {
        $log.debug('Authorization', data);

        // TODO: Remember Me Implementation
        this.lastSessionKey = data._sk.$oid;
        this.lastSessionSecret = data._ss;
        $cookies.put('nsk', this.lastSessionKey);
        $cookies.put('nss', this.lastSessionSecret);

        // TODO: Pass to user service
        this.user.setData(data.info);
        this.user.role = 1;

        this.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTHENTICATE, { detail: { user: this.user } }));

        return $q(function (res) {
          res(data);
        });
      },

      reauth: function () {
        var sk = $cookies.get('nsk') || this.lastSessionKey;
        var ss = $cookies.get('nss') || this.lastSessionSecret;

        if (ss && sk) {
          return WsService.request(
            'session/recall',
            { _sk: sk, _ss: ss}
          ).then(
            this.authorize.bind(this)
          ).catch(
            this.unauthorize.bind(this)
          );
        }

        this.isAuthenticated() && this.unauthorize('Re-Authentication Failed');

        return $q(function (res, rej) {
          rej();
        });
      },

      unauthorize: function (reason) {
        $log.debug('Unauthorization', reason);
        this.user.username = null;

        this.lastSessionKey = null;
        this.lastSessionSecret = null;
        $cookies.remove('nss');
        $cookies.remove('nsk');

        WsService.unauthorize();

        this.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHENTICATE, { detail: { reason: reason } }));

        return $q(function (res) {
          res(reason);
        });
      },

      login: function (credentials, remember) {
        this.remember = remember;
        this.logout('Pre Login');

        return WsService.request(
          'session/register',
          {
            uid: credentials.username,
            pass: credentials.password
          }
        ).then(
          this.authorize.bind(this)
        );
      },

      logout: function (reason) {
        return this.unauthorize(reason || 'User Logout');

        return WsService.request('logout').then(this.unauthorize.bind(this));
      },

      isAuthenticated: function () {
        return this.user.username || $cookies.get('nsk');
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
