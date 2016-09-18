(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('ResetPasswordController', ResetPasswordController);

  /** @ngInject */
  function ResetPasswordController($state, md5, toastr,
                                   NST_DEFAULT, NstSvcAuth, NstHttp) {
    var vm = this;

    vm.step1 = true;
    vm.step2 = false;
    vm.step3 = false;

    vm.submitNumber = function () {

      if (!vm.phone) {
        return false;
      } else {
        vm.step = "step1";
      }

      vm.getCodeRequest = true;

      var ajax = new NstHttp('/forgot/', {
        f: 'verify_phone',
        phone: vm.phone,
        uid: vm.uid
      });
      ajax.get().then(function (data) {
        vm.getCodeRequest = false;
        if (data.status == "ok") {
          if (data.code) vm.verificationCode = data.code;
          vm.vid = data.vid;
          vm.step1 = false;
          vm.step2 = true;
        } else {
          vm.step1 = true;
          vm.step2 = false;
          toastr.error("Can not find Username or Phone number!")
        }
      }).catch(function (error) {
        vm.step1 = true;
        vm.step2 = false;
        vm.getCodeRequest = false;
        toastr.error("Error in validation your Username or Phone number!")
      });
    };

    vm.submitCode = function () {

      vm.verification = 'start';

      var ajax = new NstHttp('/forgot/',
        {
          f: 'verify_phone_code',
          vid: vm.vid,
          code: vm.verificationCode
        });

      ajax.get().then(function (data) {
        if (data.status == 'ok') {
          vm.step2 = false;
          vm.step3 = true;
          vm.verificationWrongCode = false;
        }
        else {
          toastr.error("Code is not valid!");
          vm.verificationWrongCode = true;
        }
        vm.verification = 'finished';

      })
        .catch(function (error) {
          toastr.error("Error in validation code!");
          vm.verification = 'wrong';
        });

    };

    vm.resetPass = function () {

      var postData = new FormData();
      postData.append('f', 'reset_password');
      postData.append('vid', vm.vid);
      postData.append('uid', vm.uid);
      postData.append('phone', vm.phone);
      postData.append('pass', md5.createHash(vm.password));

      var ajax = new NstHttp('/forgot/', postData);

      ajax.post().then(function (data) {
        if (data.data.status === "ok") {
          $state.go(NST_DEFAULT.STATE);
          toastr.success("Password changed successfully!");
        } else {
          toastr.error("Error in recover password!");
        }
      }).catch(function () {
        toastr.error("Error in recover password!");
      })

    }

  }
})();
