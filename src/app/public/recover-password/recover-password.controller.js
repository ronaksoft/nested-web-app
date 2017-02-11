(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RecoverPasswordController', RecoverPasswordController);

  /** @ngInject */
  function RecoverPasswordController($scope, $state, $q, md5, toastr,
    NST_DEFAULT, NstSvcAuth, NstHttp, NstSvcTranslation) {
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

    eventReferences.push($scope.$on(vm.previousStepEventKey, function (event, data) {
      vm.step--;
    }));

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });
  }
})();
