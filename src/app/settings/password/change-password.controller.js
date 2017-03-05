(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('ChangePasswordController', ChangePasswordController);

  /** @ngInject */
  function ChangePasswordController($scope, $log, $state,
    toastr,
    NstSvcUserFactory,
    NST_SRV_ERROR, NST_NAVBAR_CONTROL_TYPE, NstSvcTranslation) {
    var vm = this;

    vm.model = {
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    };

    vm.change = change;

    function change(isValid) {
      vm.submitted = true;
      if (isValid) {
        if (vm.model.newPassword.length < 6 || vm.model.newPassword.length > 24) {
          toastr.error(NstSvcTranslation.get('Your new password must be between 6 and 26 characters.'));
          return;
        }
        NstSvcUserFactory.changePassword(vm.model.oldPassword, vm.model.newPassword).then(function(result) {
          toastr.success(NstSvcTranslation.get('You have changed your password successfully.'));
        }).catch(function(error) {
          if (error.code === NST_SRV_ERROR.INVALID) {
            var message = _.first(error.message);
            if (message === 'old_pass') {
              toastr.error(NstSvcTranslation.get('The old password you have entered is incorrect'));
            } else {
              toastr.error(NstSvcTranslation.get('An error has occured while trying to chaing your password'));
            }
          }

        });
      }
    }
  }
})();
