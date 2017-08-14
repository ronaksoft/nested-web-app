(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('PasswordStepController', PasswordStepController);

  /** @ngInject */
  function PasswordStepController($scope, md5, NstSvcUserFactory, NST_SRV_ERROR, _) {
    var vm = this;


    vm.nextStep = nextStep;
    var eventReferences = [];

    function nextStep(phone) {
      eventReferences.push($scope.$emit(vm.onCompleted, { phone :  phone}));
    }

    vm.submit = function(formIsValid) {
      vm.submitError = null;
      if (!formIsValid) {
        return;
      }

      var phone = getPhoneNumber();
      NstSvcUserFactory.changePhone(phone, vm.verificationId, md5.createHash(vm.password)).then(function () {
        nextStep(phone);
      }).catch(function (error) {
        if (error.code === NST_SRV_ERROR.INVALID && error.message[0] === 'pass') {
          vm.submitError = 'wrongPassword';
        } else {
          vm.submitError = 'unknown';
        }
      });
    };

    function getPhoneNumber() {
      if (vm.countryCode && vm.phone) {
        return vm.countryCode.toString() + _.trimStart(vm.phone.toString(), "0");
      }
      return "";
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
