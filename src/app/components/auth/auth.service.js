(function() {
  'use strict';

  angular
    .module('nested')
    .constant('AUTH_EVENTS', {
      loginSuccess: 'auth-login-success',
      loginFailed: 'auth-login-failed',
      logoutSuccess: 'auth-logout-success',
      sessionTimeout: 'auth-session-timeout',
      notAuthenticated: 'auth-not-authenticated',
      notAuthorized: 'auth-not-authorized'
    })
    .service('AuthService', NestedAuthService);

  /** @ngInject */
  function NestedAuthService($cookies, $window, WS_EVENTS, WsService, NestedUser, $log) {
    function AuthService() {
      this.user = new NestedUser();
      this.lastSessionKey = null;
      this.lastSessionSecret = null;
      this.remember = false;
      this.listeners = {};

      if ($window.sessionStorage.getItem('nsu')) {
        this.user.setData(angular.fromJson($window.sessionStorage.getItem('nsu')));
      }

      if (WsService.isInitialized()) {
        this.reauth();
      }

      WsService.addEventListener(WS_EVENTS.ERROR, this.unauthorize);
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
        $window.sessionStorage.setItem('nsu', angular.toJson(this.user));

        return data;
      },

      reauth: function () {
        var sk = $cookies.get('nsk') || this.lastSessionKey;
        var ss = $cookies.get('nss') || this.lastSessionSecret;

        if (ss && sk) {
          return WsService.request('auth', { _sk: sk, _ss: ss})
            .then(this.authorize.bind(this), this.unauthorize.bind(this));
        }
      },

      unauthorize: function (reason) {
        $log.debug('Unauthorization', reason);
        this.user.username = null;

        window.sessionStorage.clear();
        this.lastSessionKey = null;
        this.lastSessionSecret = null;
        $cookies.remove('nss');
        $cookies.remove('nsk');
        WsService.unauthorize();
      },

      login: function (credentials, remember) {
        this.remember = remember;
        this.logout();

        return WsService.request('login', {
          uid: credentials.username,
          pass: credentials.password
        }).then(this.authorize.bind(this));
      },

      logout: function () {
        this.unauthorize();
        return new Promise(function (res, rej) {
          res.call(this);
        }.bind(this));

        return WsService.request('logout').then(this.unauthorize);
      },

      isAuthenticated: function (callback) {
        var isAuth = null != this.user.username || $cookies.get('nsk') || WsService.isAuthorized();

        if (angular.isFunction(callback)) {
          if (isAuth) {
            callback(new CustomEvent(WS_EVENTS.AUTHORIZE));
          } else {
            WsService.addEventListener(WS_EVENTS.AUTHORIZE, callback);
          }
        }

        return isAuth;
      },

      // Access Control
      isAuthorized: function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }

        return (this.isAuthenticated() && authorizedRoles.indexOf(this.user.role) !== -1);
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

    return new AuthService();
  }

})();
