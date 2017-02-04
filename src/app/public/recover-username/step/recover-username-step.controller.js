(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RecoverUsernameStepController', RecoverUsernameStepController);

  /** @ngInject */
  function RecoverUsernameStepController($scope, $state, $q, md5, toastr,
    NST_DEFAULT, NstSvcAuth, NstHttp, NstSvcTranslation) {
    var vm = this;

    (function () {
      recoverUsername(vm.verificationId).then(function (data) {
        console.log(data);
      }).catch(function (reason) {

      });
    })();

    function recoverUsername(verificationId) {
      var deferred = $q.defer();

      vm.recoverUsernameProgress = true;
      new NstHttp('', {
        cmd: 'auth/recover_username',
        data: {
          'vid': verificationId,
        }
      }).post().then(function(result) {
        if (result.status === "ok") {
          vm.username = result.data.uid;
          deferred.resolve(result.data);
        } else {
          deferred.reject('unknown');
        }
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.recoverUsernameProgress = false;
      });

      return deferred.promise;
    }

  }
})();
