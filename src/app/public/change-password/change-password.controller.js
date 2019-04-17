(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('ForceChangePasswordController', RecoverPasswordController);

  /** @ngInject */
  function RecoverPasswordController($scope, $log, $state,
                                     toastr,
                                     NstSvcUserFactory, NstSvcAuth,
                                     NST_SRV_ERROR, NstSvcTranslation) {
    var vm = this;
    vm.signout = signout;
    vm.ready = true;
    vm.user = NstSvcAuth.user;
    vm.model = {
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    };

    vm.change = change;

    if (!vm.user){
      signout();
    }

    function change(isValid) {
      vm.submitted = true;
      if (isValid) {
        if (vm.model.newPassword.length < 6) {
          toastr.error(NstSvcTranslation.get('Your new password must be between 6 characters.'));
          return;
        }
        NstSvcUserFactory.changePassword(vm.model.oldPassword, vm.model.newPassword).then(function () {
          toastr.success(NstSvcTranslation.get('You have changed your password successfully.'));
          vm.model = {
            oldPassword: '',
            newPassword: '',
            newPasswordConfirm: ''
          };
          vm.submitted = false;

          $state.go('app.messages-favorites');

        }).catch(function (error) {
          if (error.err_code === NST_SRV_ERROR.INVALID) {
            return toastr.error(NstSvcTranslation.get('The old password you have entered is incorrect'));
          } else {
            return toastr.error(NstSvcTranslation.get('An error has occured while trying to chaing your password'));
          }

        });
      }
    }


    function signout() {

      NstSvcAuth.logout();
      $state.go('public.signin');

    }


  }
})();
