(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('ChangePasswordController', ChangePasswordController);

  /** @ngInject */
  function ChangePasswordController($scope, $log, $state,
    toastr,
    NstSvcUserFactory, NstSvcLoader, NstVmNavbarControl,
    NST_SRV_ERROR, NST_NAVBAR_CONTROL_TYPE) {
    var vm = this;

    vm.controls = {
      left: [
        new NstVmNavbarControl('Back to Profile', NST_NAVBAR_CONTROL_TYPE.BUTTON, $state.href('app.profile'))
      ],
      right: []
    };

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
          toastr.error('Your new password must be between 6 and 26 characters.');
          return;
        }
        var changePasswordPromise = NstSvcUserFactory.changePassword(vm.model.oldPassword, vm.model.newPassword);
        NstSvcLoader.inject(changePasswordPromise);
        changePasswordPromise.then(function(result) {
          toastr.success('Your pasword changed successfully.')
          $state.go('app.profile');
        }).catch(function(error) {
          if (error.code === NST_SRV_ERROR.INVALID) {
            var message = _.first(error.message);
            if (message === 'old_pass') {
              toastr.error('Your old password is wrong!');
            }
          }

        });
      }
    }
  }
})();
