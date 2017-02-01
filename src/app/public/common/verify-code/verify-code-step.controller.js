(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('VerifyCodeStepController', VerifyCodeStepController);

  /** @ngInject */
  function VerifyCodeStepController($scope, $state, $timeout, $stateParams, md5, toastr, NST_DEFAULT, NST_PATTERN, NstSvcAuth, NstHttp, $q, NstSvcTranslation) {
    var vm = this;

    vm.nextStep = nextStep;
    vm.previousStep = previousStep;
    vm.resend = resend;
    vm.callMe = callMe;
    var eventReferences = [];

    (function() {

    })();

    function nextStep() {
      eventReferences.push($scope.$emit(vm.onCompleted, { verified : true }));
    }

    function previousStep() {
      eventReferences.push($scope.$emit(vm.onPrevious, { phone : vm.phone }));
    }

    function resendVerificationCode(verificationId, phoneNumber) {
      var deferred = $q.defer();

      vm.resendVerificationCodeProgress = true;
      var request = new NstHttp('', {
        cmd: 'auth/send_text',
        data: {
          'vid': verificationId,
        }
      });

      request.post().then(function(response) {
        deferred.resolve(true);
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.resendVerificationCodeProgress = false;
      });

      return deferred.promise;
    }

    function resend() {
      resendVerificationCode(vm.verificationId, vm.phone).then(function() {
        toastr.success(NstSvcTranslation.get("Verification code has been sent again."));
      }).catch(function(error) {
        toastr.error(NstSvcTranslation.get("An error has occurred in sending a new verification code."));
      });
    }

    function callForVerification(verificationId, phoneNumber) {
      var deferred = $q.defer();

      vm.callForVerificationProgress = true;
      var request = new NstHttp('', {
        cmd: 'auth/call_phone',
        data: {
          vid: verificationId,
        }
      });

      request.post().then(function(response) {
        deferred.resolve(true);
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.callForVerificationProgress = false;
      });

      return deferred.promise;
    }

    function callMe() {
      callForVerification(vm.verificationId, vm.phone).then(function() {
        toastr.success(NstSvcTranslation.get("We are calling you now!"));
      }).catch(function() {
        toastr.error(NstSvcTranslation.get("An error has occurred in trying to reach you via phone call."));
      });
    }

    function verifyCode(verificationId, code) {
      var deferred = $q.defer();
      var request = new NstHttp('', {
        cmd: 'auth/verify_code',
        data: {
          vid: verificationId,
          code: code,
        }
      });

      vm.verificationProgress = true;
      request.post().then(function(response) {
        if (response.status === 'ok') {
          deferred.resolve(true);
        } else {
          deferred.reject('unknown');
        }
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.verificationProgress = false;
      });

      return deferred.promise;
    }

    vm.verify = function() {
      verifyCode(vm.verificationId, vm.verificationCode).then(function() {
        nextStep();
      }).catch(function(error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in verifying the code.'));
      });
    }

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
