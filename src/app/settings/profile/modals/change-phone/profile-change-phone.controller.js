(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('ChangePhoneController', ChangePhoneController);

  /** @ngInject */
  function ChangePhoneController($scope, $uibModalInstance) {
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

    eventReferences.push($scope.$on(vm.previousStepEventKey, function (event) {
      vm.autoSubmit = false;
      vm.step--;
    }));

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

    function getPhoneNumber() {
      if (vm.code && vm.phone) {
        return vm.code.toString() + _.trimStart(vm.phone.toString(), "0");
      }

      return "";
    }

  }
})();
