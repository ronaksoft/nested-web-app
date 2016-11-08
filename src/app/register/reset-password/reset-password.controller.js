(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('ResetPasswordController', ResetPasswordController);

  /** @ngInject */
  function ResetPasswordController($state, $q, md5, toastr,
    NST_DEFAULT, NstSvcAuth, NstHttp) {
    var vm = this;

    (function() {
      vm.step = 1;

    })();

    function nextStep() {
      vm.step++;
    }

    function previousStep() {
      if (vm.step > 1) {
        vm.step--;
      }
    }

    function sendNumber(phoneNumber) {
      var deferred = $q.defer();

      var request = new NstHttp('/forgot/', {
        f: 'verify_phone',
        phone: phoneNumber
      });
      vm.submitNumberProgress = true;

      request.get().then(function(data) {
        if (data.status === "ok") {
          deferred.resolve({
            verificationId: data.vid
          });
        } else if (data.status === "err") {
          deferred.reject('notfound');
        }
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.submitNumberProgress = false;
      });

      return deferred.promise;
    }

    vm.submitNumber = function() {
      sendNumber(vm.phone).then(function(result) {
        vm.verificationId = result.verificationId;
        nextStep();
      }).catch(function(reason) {
        if (reason === 'notfound') {
          toastr.error('Could not find your phone number.');
        } else {
          toastr.error('Sorry, an error happened while trying to recover your password. Please contact us.');
        }
      });
    };

    function sendCode(verificationId, code) {
      var deferred = $q.defer();

      var request = new NstHttp('/forgot/', {
        f: 'verify_phone_code',
        vid: verificationId,
        code: code
      });
      vm.codeVerificationProgress = true;
      request.get().then(function(data) {
        if (data.status === 'ok') {
          deferred.resolve(true);
        } else {
          deferred.reject('wrong');
        }
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.codeVerificationProgress = false;
      });

      return deferred.promise;
    }

    vm.submitCode = function() {
      sendCode(vm.verificationId, vm.verificationCode).then(function() {
        nextStep();
      }).catch(function(reason) {
        if (reason === 'wrong') {
          toastr.error('The provided code is wrong!');
        } else {
          toastr.error('Sorry, and error happend while verifing the code.');
        }
      });
    };

    function sendNewPassword(verificationId, phone, password) {
      var deferred = $q.defer();

      var data = new FormData();
      data.append('f', 'reset_password');
      data.append('vid', verificationId);
      data.append('phone', phone);
      data.append('pass', password);

      var request = new NstHttp('/forgot/', data);
      vm.resetPasswordProgress = true;
      request.post().then(function(result) {
        console.log(result);
        if (result.data.status === "ok") {
          deferred.resolve(true);
        } else {
          deferred.reject('unknown');
        }
      }).catch(function(error) {
        console.log(error);
        deferred.reject('unknown');
      }).finally(function() {
        vm.resetPasswordProgress = false;
      });

      return deferred.promise;
    }

    vm.resetPass = function() {

      sendNewPassword(vm.verificationId, vm.phone, md5.createHash(vm.password)).then(function(result) {
        toastr.success("Your password changed successfully.");
        $state.go('public.signin');
      }).catch(function(reason) {
        toastr.error('Sorry, an error happened while reseting your password.');
      });

    }

  }
})();
