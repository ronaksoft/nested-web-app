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
    .factory('AuthService', ['$cookieStore', 'WsService', NestedAuth]);

  /** @ngInject */
  function NestedAuth($cookieStore, WsService) {
    var authService = {};

    authService.login = function (credentials) {
      WsService.stream.onMessage(
        function (ws) {
          var response = JSON.parse(ws.data);
          switch (response.type) {
            case 'r':
              switch (response.data.status) {
                case 'ok':
                  break;

                case 'err':
                  break;
              }
              break;
          }
        }
      );

      return WsService.stream.send(JSON.stringify({
        type: 'q',
        _reqid: "REQ" + (new Date()).getTime(),
        data: {
          _appid: 'APP_WEB_237400002374',
          _as: '030c8a3c14bcef61d6adab5cac34cede',
          cmd: 'login',
          uid: credentials.username,
          pass: credentials.password
        }
      }));
    };

    authService.isAuthenticated = function () {
      return !!Session.userId;
    };

    // Access Control
    authService.isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }

      return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return authService;
  }

})();
