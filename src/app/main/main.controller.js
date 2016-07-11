(function() {
  'use strict';

  angular
    .module('nested')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($location, $interval, $http, WS_ERROR, WS_RESPONSE_STATUS, LoaderService, AuthService) {
    var vm = this;

    if (AuthService.isInAuthorization()) {
      $location.path('/events').replace();
    }

    vm.invitation = {
      sent: false,
      error: ""
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
              vm.invitation.sent = true;
              return $q(function (res) {
                res();
              });
              break;

            default:
              switch (response.err_code) {
                case WS_ERROR.DUPLICATE:
                  vm.invitation.sent = true;
                  return $q(function (res) {
                    res();
                  });
                  break;

                default:
                  return $q(function (res, rej) {
                    rej(response);
                  });
                  break;
              }
              break;
          }
        })).catch(function (error) {
          vm.invitation.error = "There was an error in submitting your pioneer invitation request. Please try again later!";
        });
      }
    };
  }
})();
