/**
 * @file src/app/public/recover-password/recover-password.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Performs moving between steps and passing values between two step
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-05
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RecoverPasswordController', RecoverPasswordController);

  /** @ngInject */
  /**
   * A component that wraps password recovery steps
   *
   * @param {any} $scope
   * @param {any} $state
   */
  function RecoverPasswordController($scope, $state, _) {
    var vm = this;

    vm.phoneSubmittedEventKey = 'recover-password-phone-submitted';
    vm.codeVerifiedEventKey = 'recover-password-code-verified';
    vm.completedEventKey = 'recover-password-completed';
    vm.previousStepEventKey = 'recover-password-change-phone';
    vm.verificationId = null;
    vm.phone = null;
    vm.code = null;
    vm.step = 1;

    vm.ready = true;

    var eventReferences = [];

    eventReferences.push($scope.$on(vm.phoneSubmittedEventKey, function(event, data) {
      if (data.verificationId && data.phone) {
        vm.verificationId = data.verificationId;
        vm.phone = data.phone;
        vm.step++;
      }
    }));

    eventReferences.push($scope.$on(vm.codeVerifiedEventKey, function(event, data) {
      if (data.verified) {
        vm.step++;
      }
    }));

    eventReferences.push($scope.$on(vm.completedEventKey, function(event, data) {
      if (data.done) {
        $state.go("public.signin");
      }
    }));

    eventReferences.push($scope.$on(vm.previousStepEventKey, function () {
      vm.step--;
    }));

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
