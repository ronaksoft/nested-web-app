/**
 * @file src/app/settings/password/change-password.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user changes his/her password
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-01
 * Reviewed by:            -
 * Date of review:         -
 */

(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('ChangePasswordController', ChangePasswordController);

  /** @ngInject */
  /**
   * In order to change the user password, The page asks he/she the old and the new password
   *
   * @param {any} $scope 
   * @param {any} $log 
   * @param {any} $state 
   * @param {any} toastr 
   * @param {any} NstSvcUserFactory 
   * @param {any} NST_SRV_ERROR 
   * @param {any} NST_NAVBAR_CONTROL_TYPE 
   * @param {any} NstSvcTranslation 
   */
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

    /**
     * Validates and sets the new password
     * 
     * @param {any} isValid 
     * @returns 
     */
    function change(isValid) {
      // Sets submitted to true to make the enable form validation on any field change
      vm.submitted = true;

      if (isValid) {
        if (vm.model.newPassword.length < 6) {
          toastr.error(NstSvcTranslation.get('Your new password must be between 6 characters.'));
          return;
        }
        // Changes the password
        NstSvcUserFactory.changePassword(vm.model.oldPassword, vm.model.newPassword).then(function(result) {
          toastr.success(NstSvcTranslation.get('You have changed your password successfully.'));
          // Clears the form
          vm.model = {
            oldPassword: '',
            newPassword: '',
            newPasswordConfirm: ''
          };
          vm.submitted = false;

        }).catch(function(error) {
            console.log(error);
          if (error.code === NST_SRV_ERROR.INVALID) {
              return toastr.error(NstSvcTranslation.get('The old password you have entered is incorrect'));
          } else {
              return toastr.error(NstSvcTranslation.get('An error has occured while trying to chaing your password'));
          }

        });
      }
    }
  }
})();
