(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RecoverUsernameController', RecoverUsernameController);

  /** @ngInject */
  function RecoverUsernameController($scope, $state, $q, md5, toastr,
    NST_DEFAULT, NstSvcAuth, NstHttp, NstSvcTranslation) {
    var vm = this;

    vm.phoneSubmittedEventKey = 'recover-username-phone-submitted';
    vm.codeVerifiedEventKey = 'recover-username-code-verified';
    vm.completedEventKey = 'recover-username-completed';
    vm.previousStepEventKey = 'recover-username-change-phone';
    vm.phone = null;
    vm.verificationId = null;
    vm.country = null;
    vm.step = 1;

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
        return $state.go("signin");
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
