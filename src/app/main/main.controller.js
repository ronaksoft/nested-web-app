(function() {
  'use strict';

  angular
    .module('nested')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($q, $location, $http,
                          WS_ERROR, WS_RESPONSE_STATUS,
                          LoaderService, AuthService) {
    var vm = this;

    if (AuthService.isInAuthorization()) {
      $location.path('/events').replace();
    }

    vm.invitation = {
      sent: false,
      error: false,
      message: ""
    };

    vm.emailKeyUp = function (event) {
      if (13 === event.keyCode) {
        vm.requestInvitation(event.currentTarget.value);
      }
    };

    vm.requestInvitation = function (form) {
      vm.invitation.error = "";
      if (form.$valid) {
        var data = $.param({
          email: form.email.$modelValue
        });

        var config = {
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        };

        LoaderService.inject($http.post('http://x.nested.me/send_invite.php', data, config).then(function (response) {
          switch (response.status) {
            case WS_RESPONSE_STATUS.SUCCESS:
              return $q(function (res) {
                res(response);
              });
              break;

            default:
              return $q(function (res, rej) {
                rej(response);
              });
              break;
          }
        })).catch(function (response) {
          vm.invitation.error = true;
          vm.invitation.message = response.msg;
        }).then(function (response) {
          vm.invitation.sent = true;
          vm.invitation.message = response.msg;
        });
      }
    };
  }
})();
