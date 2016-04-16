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
    .factory('AuthService', NestedAuth);

  /** @ngInject */
  function NestedAuth($cookies, $window, WS_EVENTS, WsService, $log) {
    function AuthService() {
      this.user = null;
      this.remember = false;
      this.listeners = {};

      if ($window.sessionStorage.getItem('nsu')) {
        this.user = angular.fromJson($window.sessionStorage.getItem('nsu'));
      }

      WsService.addEventListener(WS_EVENTS.UNINITIALIZE, this.unauthorize);
      WsService.registerAuthorizeFn(function () {
        if (!!$cookies.get('nsk') && !!$cookies.get('nss')) {
          return WsService.request('auth', {
            _sk: $cookies.get('nsk'),
            _ss: $cookies.get('nss')
          }).then(this.authorize.bind(this), this.unauthorize.bind(this));
        }

        return Promise.reject();
      }.bind(this));
    }

    AuthService.prototype = {
      authorize: function (data) {
        $log.debug('Authorization');

        // TODO: Remember Me Implementation
        $cookies.put('nsk', data._sk.$oid);
        $cookies.put('nss', data._ss);

        // TODO: Pass to user service
        this.user = data.info;
        this.user.role = 1;
        $window.sessionStorage.setItem('nsu', angular.toJson(this.user));

        return data;
      },

      unauthorize: function () {
        $log.debug('Unauthorization');
        this.user = null;

        // delete $window.sessionStorage.removeItem('nsu');
        window.sessionStorage.clear();

        $cookies.remove('nss');
        $cookies.remove('nsk');
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
        return Promise.resolve();

        return WsService.request('logout').then(this.unauthorize);
      },

      isAuthenticated: function (callback) {
        var isAuth = null != this.user;

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

      getSessionKey: function () {
        return $cookies.get('nsk');
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
