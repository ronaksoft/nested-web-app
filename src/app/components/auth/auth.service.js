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
  function NestedAuth($cookies, $window, WsService) {
    var authService = {
      user: null,
      remember: false
    };

    var cLogin = function (data) {
      $cookies.put('nsk', data._sk.$oid);

      if (this.remember) {
        $cookies.put('nss', data._ss);
      }

      // TODO: Pass to user service
      this.user = data.info;
      this.user.role = 1;
      $window.sessionStorage.setItem('nst', angular.toJson(this.user));

      return data;
    }.bind(authService);

    authService.login = function (credentials, remember) {
      this.remember = remember;
      this.logout();

      return WsService.request('login', {
        uid: credentials.username,
        pass: credentials.password
      }).then(cLogin);
    };

    authService.logout = function () {
      var unauthorize = function () {
        this.user = null;
        delete $window.sessionStorage.removeItem('nst');

        $cookies.remove('nss');
        $cookies.remove('nsk');
      }.bind(this);

      unauthorize();
      return Promise.resolve();

      return WsService.request('logout').then(unauthorize);
    };

    authService.isAuthenticated = function () {
      if (null !== this.user) {
        return Promise.resolve();
      } else if ($window.sessionStorage.getItem('nst')) {
        this.user = angular.fromJson($window.sessionStorage.getItem('nst'));
        return Promise.resolve();
      } else if (!!$cookies.get('nsk') && !!$cookies.get('nss')) {
        this.remember = true;

        return WsService.request('auth', {
          _sk: $cookies.get('nsk'),
          _ss: $cookies.get('nss')
        }).then(cLogin);
      } else {
        return Promise.reject();
      }
    };

    // Access Control
    authService.isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }

      return (authService.isAuthenticated() && authorizedRoles.indexOf(this.user.role) !== -1);
    };

    authService.getSessionKey = function () {
      return $cookies.get('nsk');
    };

    authService.isAuthenticated();

    return authService;
  }

})();
