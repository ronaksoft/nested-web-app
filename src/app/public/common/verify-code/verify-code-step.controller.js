/**
 * @file src/app/public/common/verify-code/verify-code-step.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A message was sent to the user that contains a verification code. She writes the code and verifies
 * her phone number. Then she is able to proceed the next step e.g. registration or password recovery.
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-05
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('VerifyCodeStepController', VerifyCodeStepController);

  /** @ngInject */
  /**
   * Gives the user an input to enter her Nested veriufication code
   *
   * @param {any} $scope
   * @param {any} $state
   * @param {any} $timeout
   * @param {any} $stateParams
   * @param {any} md5
   * @param {any} toastr
   * @param {any} NST_DEFAULT
   * @param {any} NST_PATTERN
   * @param {any} NstSvcAuth
   * @param {any} NstHttp
   * @param {any} $q
   * @param {any} NstSvcTranslation
   */
  function VerifyCodeStepController($scope, md5, _, toastr, NST_DEFAULT, NST_PATTERN, NstSvcAuth, NstHttp, $q, NstSvcTranslation) {
    var vm = this;

    vm.nextStep = nextStep;
    vm.previousStep = previousStep;
    vm.resend = resend;
    vm.callMe = callMe;
    var eventReferences = [];

    (function() {
      vm.ready = true;
    })();

    /**
     * Emits an event that leads to moving forward
     *
     */
    function nextStep() {
      eventReferences.push($scope.$emit(vm.onCompleted, { verified : true }));
    }

    /**
     * Emits an event that leads to moving backward
     *
     */
    function previousStep() {
      eventReferences.push($scope.$emit(vm.onPrevious, { phone : vm.phone }));
    }

    /**
     * Resends a message that contains the verification code
     *
     * @param {any} verificationId
     * @param {any} phoneNumber
     * @returns
     */
    function resendVerificationCode(verificationId) {
      var deferred = $q.defer();

      vm.resendVerificationCodeProgress = true;
      var request = new NstHttp('', {
        cmd: 'auth/send_text',
        data: {
          'vid': verificationId
        }
      });

      request.post().then(function() {
        deferred.resolve(true);
      }).catch(function() {
        deferred.reject('unknown');
      }).finally(function() {
        vm.resendVerificationCodeProgress = false;
      });

      return deferred.promise;
    }

    /**
     * Resends the verification code via SMS and notifies the user
     *
     */
    function resend() {
      resendVerificationCode(vm.verificationId, vm.phone).then(function() {
        toastr.success(NstSvcTranslation.get("Verification code has been sent again."));
      }).catch(function() {
        toastr.error(NstSvcTranslation.get("An error has occurred in sending a new verification code."));
      });
    }

    /**
     * A machine reads the verification code over the phone by calling the given phone number
     *
     * @param {any} verificationId
     * @param {any} phoneNumber
     * @returns
     */
    function callForVerification(verificationId) {
      var deferred = $q.defer();

      vm.callForVerificationProgress = true;
      var request = new NstHttp('', {
        cmd: 'auth/call_phone',
        data: {
          vid: verificationId
        }
      });

      request.post().then(function() {
        deferred.resolve(true);
      }).catch(function() {
        deferred.reject('unknown');
      }).finally(function() {
        vm.callForVerificationProgress = false;
      });

      return deferred.promise;
    }

    /**
     * Requests for a call
     *
     */
    function callMe() {
      callForVerification(vm.verificationId, vm.phone).then(function() {
        toastr.success(NstSvcTranslation.get("We are calling you now!"));
      }).catch(function() {
        toastr.error(NstSvcTranslation.get("An error has occurred in trying to reach you via phone call."));
      });
    }

    /**
     * Sends the verification code to Cyrus
     *
     * @param {any} verificationId
     * @param {any} code
     * @returns
     */
    function verifyCode(verificationId, code) {
      var deferred = $q.defer();
      var request = new NstHttp('', {
        cmd: 'auth/verify_code',
        data: {
          vid: verificationId,
          code: code
        }
      });

      vm.verificationProgress = true;
      request.post().then(function(response) {
        if (response.status === 'ok') {
          deferred.resolve(true);
        } else {
          deferred.reject('unknown');
        }
      }).catch(function() {
        deferred.reject('unknown');
      }).finally(function() {
        vm.verificationProgress = false;
      });

      return deferred.promise;
    }
    // verifies and moves to the next step if
    // the phone number has been verified successfully.
    vm.verify = function() {
      verifyCode(vm.verificationId, vm.verificationCode).then(function() {
        nextStep();
      }).catch(function() {
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
