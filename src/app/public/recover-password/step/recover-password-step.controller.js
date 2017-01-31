(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RecoverPasswordStepController', RecoverPasswordStepController);

  /** @ngInject */
  function RecoverPasswordStepController($scope, $state, $q, md5, toastr,
    NST_DEFAULT, NstSvcAuth, NstHttp, NstSvcTranslation) {
    var vm = this;

    vm.resetPassword = resetPassword;

    function nextStep() {
      eventReferences.push($scope.$emit(vm.onCompleted, {
        done: true
      }));
    }

    function sendNewPassword(verificationId, phone, password) {
      var deferred = $q.defer();

      vm.resetPasswordProgress = true;
      var request = new NstHttp('', {
        cmd: 'auth/recover_pass',
        data: {
          'vid': verificationId,
          'phone': phone,
          'pass': password,
        }
      }).post().then(function(result) {
        if (result.data.status === "ok") {
          deferred.resolve(true);
        } else {
          deferred.reject('unknown');
        }
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.resetPasswordProgress = false;
      });

      return deferred.promise;
    }

    function resetPassword(isValid) {
      vm.submitted = true;
      if (!isValid) {
        return;
      }

      sendNewPassword(vm.verificationId, vm.phone, md5.createHash(vm.password)).then(function(result) {
        toastr.success(NstSvcTranslation.get("You've changed your password successfully."));
        nextStep();
      }).catch(function(reason) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in reseting your password.'));
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
