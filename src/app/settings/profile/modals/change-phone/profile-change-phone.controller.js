(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('ChangePhoneController', ChangePhoneController);

  /** @ngInject */
  function ChangePhoneController($scope, $uibModalInstance, _) {
    var vm = this;
    var eventReferences = [];

    vm.phoneSubmittedEventKey = 'change-phone-submitted';
    vm.codeVerifiedEventKey = 'change-phone-code-verified';
    vm.completedEventKey = 'change-phone-completed';
    vm.previousStepEventKey = 'change-phone-change-phone';
    vm.phone = null;
    vm.verificationId = null;
    vm.country = null;
    vm.step = 1;


    (function () {

    })();

    eventReferences.push($scope.$on(vm.phoneSubmittedEventKey, function(event, data) {
      if (data.verificationId && data.phone) {
        vm.verificationId = data.verificationId;
        vm.step++;
      }
    }));

    eventReferences.push($scope.$on(vm.codeVerifiedEventKey, function(event, data) {
      if (data.verified) {
        vm.step++;
      }
    }));

    eventReferences.push($scope.$on(vm.completedEventKey, function(event, data) {
      $uibModalInstance.close(data.phone);
    }));

    eventReferences.push($scope.$on(vm.previousStepEventKey, function () {
      vm.autoSubmit = false;
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
