(function() {
  'use strict';

  angular
    .module('nested')
    .controller('IntroController', IntroController);

  /** @ngInject */
  function IntroController($q, $state, $http,
                           NST_SRV_RESPONSE_STATUS, NST_DEFAULT, NST_CONFIG,
                           NstSvcLoader, NstSvcAuth) {
    var vm = this;

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

        NstSvcLoader.inject($http.post(NST_CONFIG.PIONEER_INVITATION.URL, data, config)).then(function (data) {
          var response = angular.fromJson(data.data);

          switch (response.status) {
            case NST_SRV_RESPONSE_STATUS.SUCCESS:
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
        }).catch(function (response) {
          vm.invitation.error = true;
          vm.invitation.message = response.msg;

          return $q(function (res, rej) {
            rej(response);
          });
        }).then(function (response) {
          vm.invitation.sent = true;
          vm.invitation.message = response.msg;

          return $q(function (res) {
            res(response);
          });
        });
      }
    };
  }
})();
