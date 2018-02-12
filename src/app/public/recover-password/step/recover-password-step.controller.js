/**
 * @file src/app/public/recover-password/step/recover-password-step.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user changes her password. but, she must have been verified before this action.
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-05
 * Reviewed by:            -
 * Date of review:         -
 */

(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RecoverPasswordStepController', RecoverPasswordStepController);

  /** @ngInject */
  /**
   * Gives the user a chance to change her password by entring a new password.
   *
   * @param {any} $scope
   * @param {any} $state
   * @param {any} $q
   * @param {any} md5
   * @param {any} toastr
   * @param {any} NST_DEFAULT
   * @param {any} NstSvcAuth
   * @param {any} NstHttp
   * @param {any} NstSvcTranslation
   */
  function RecoverPasswordStepController($scope, $state, $q, md5, _, toastr,
     NstHttp, NstSvcTranslation) {
    var vm = this;
    var eventReferences = [];

    vm.resetPassword = resetPassword;

    /**
     * Emits an event that leads to route transition.
     *
     */
    function nextStep() {
      eventReferences.push($scope.$emit(vm.onCompleted, {
        done: true
      }));
    }

    /**
     * Changes the user password using a verification Id that she has been received in the previous steps
     *
     * @param {any} verificationId
     * @param {any} phone
     * @param {any} password
     * @returns
     */
    function sendNewPassword(verificationId, phone, password) {
      var deferred = $q.defer();

      vm.resetPasswordProgress = true;
      new NstHttp('', {
        cmd: 'auth/recover_pass',
        data: {
          'vid': verificationId,
          'phone': phone,
          'new_pass': password
        }
      }).post().then(function(result) {
        if (result.status === "ok") {
          deferred.resolve(true);
        } else {
          deferred.reject('unknown');
        }
      }).catch(function() {
        deferred.reject('unknown');
      }).finally(function() {
        vm.resetPasswordProgress = false;
      });

      return deferred.promise;
    }

    /**
     * Encrypts the given password and sends to Cyrus. Then navigates to the next step by emiting an event
     *
     * @param {any} isValid
     * @returns
     */
    function resetPassword(isValid) {
      vm.submitted = true;
      if (!isValid) {
        return;
      }

      sendNewPassword(vm.verificationId, vm.phone, md5.createHash(vm.password)).then(function() {
        toastr.success(NstSvcTranslation.get("You've changed your password successfully."));
        nextStep();
      }).catch(function() {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in reseting your password.'));
      });

    }

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

  }
})();
