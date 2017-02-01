(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($scope, $state, NST_DEFAULT, NstSvcAuth) {
    var vm = this;
    vm.phoneSubmittedEventKey = 'register-phone-submitted';
    vm.codeVerifiedEventKey = 'register-code-verified';
    vm.completedEventKey = 'register-completed';
    vm.previousStepEventKey = 'register-change-phone';
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
      if (data.credentials) {
        NstSvcAuth.login(data.credentials, true).then(function() {
          return $state.go(NST_DEFAULT.STATE);
        }).catch(function() {
          return $state.go("signin");
        });
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
