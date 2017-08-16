/**
 * @file src/app/settings/profile/edit-profile.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user edits her profile if she is allowed to edit her profile or edit profile
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-01
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('EditProfileController', EditProfileController);

  /** @ngInject */
  function EditProfileController($rootScope, $q, $uibModal, $timeout,
                                 toastr, moment,
                                 NstSvcAuth, NstSvcStore, NstSvcUserFactory, NstSvcTranslation, NstSvcDate, NstSvcModal,
                                 NST_STORE_UPLOAD_TYPE, NST_PATTERN, _) {
    var vm = this;

    // Current user
    vm.model = NstSvcAuth.user;

    vm.updateName = updateName;
    vm.updateGender = updateGender;
    vm.updateSearchable = updateSearchable;
    vm.updateDateOfBirth = updateDateOfBirth;
    vm.updateEmail = updateEmail;
    vm.getGender = getGender;
    vm.changePhone = changePhone;
    vm.emailPattern = NST_PATTERN.EMAIL;


    vm.genders = [
      {key: 'x', title: ''},
      {key: 'm', title: NstSvcTranslation.get("Male")},
      {key: 'f', title: NstSvcTranslation.get("Female")},
      {key: 'o', title: NstSvcTranslation.get("Other")}
    ];

    vm.minDateOfBirth = moment(NstSvcDate.now()).subtract(100, "year").format("YYYY-MM-DD");
    vm.maxDateOfBirth = moment(NstSvcDate.now()).format("YYYY-MM-DD");

    (function () {
      vm.loadProgress = true;
      // Retrieves the user account from Cyrus and updates the model
      NstSvcUserFactory.get(vm.model.id, true).then(function (user) {
        vm.model = user;
        vm.canEditProfile = user.privacy.change_profile;
        vm.canChangePicture = user.privacy.change_picture;
      }).catch(function () {
        toastr.error('An error has occured while retrieving user profile')
      }).finally(function () {
        vm.loadProgress = false;
      });

    })();


    /**
     * Updates the user profile with the given parameters
     *
     * @param {any} params
     * @returns
     */
    function update(params) {
      var deferred = $q.defer();

      vm.updateProgress = true;
      NstSvcUserFactory.update(vm.model.id, params).then(function (user) {
        NstSvcAuth.setUser(user);
        deferred.resolve();
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("Sorry, an error has occurred while updating your profile."));
        deferred.reject();
      }).finally(function () {
        vm.updateProgress = false;
      });

      return deferred.promise;
    }

    /**
     * Updates the user first name and last name and closes the edit modal
     * if the it has been changed successfully
     * @param {any} isValid
     * @param {any} firstName
     * @param {any} lastName
     * @param {any} $close
     * @returns
     */
    function updateName(isValid, firstName, lastName, $close) {
      if (!isValid) {
        return;
      }

      return update({
        'firstName': firstName,
        'lastName': lastName
      }).then(function () {
        vm.model.firstName = firstName;
        vm.model.lastName = lastName;
        $close();
      });
    }

    /**
     * Updates the user date of birth and closes the edit modal if it has been updated successfully
     *
     * @param {any} isValid
     * @param {any} value
     * @param {any} $close
     * @returns
     */
    function updateDateOfBirth(isValid, value, $close) {
      if (!isValid) {
        return;
      }

      return update({
        'dateOfBirth': value
      }).then(function () {
        vm.model.dateOfBirth = value;
        $close();
      });
    }

    /**
     * Updates the user email address and closes the edit modal if it has been updated successfully
     *
     * @param {any} isValid
     * @param {any} value
     * @param {any} $close
     * @returns
     */
    function updateEmail(isValid, value, $close) {
      if (!isValid) {
        return;
      }

      return update({
        'email': value
      }).then(function () {
        vm.model.email = value;
        $close();
      });
    }

    /**
     * Changes the user gender and closes the edit modal if the new one has been set successfully
     *
     * @param {any} isValid
     * @param {any} value
     * @param {any} $close
     * @returns
     */
    function updateGender(isValid, value, $close) {
      if (!isValid) {
        return;
      }

      return update({
        'gender': value
      }).then(function () {
        vm.model.gender = value;
        $close();
      });
    }

    /**
     * Toggles the user searchable (in privacy) and closes the edit modal if it has been changed successfully
     *
     * @param {any} value
     * @returns
     */
    function updateSearchable(value) {
      return update({
        'searchable': !!value
      }).then(function () {
        vm.model.privacy.searchable = !!value;
      });
    }

    function getGender() {
      var selected = _.find(vm.genders, {key: vm.model.gender});

      return selected ? selected.title : vm.genders[0].title;
    }

    /**
     * Opens change-phone modal and updates the model with a the new phone number
     *
     */
    function changePhone() {
      $uibModal.open({
        animation: false,
        size: 'sm',
        templateUrl: 'app/settings/profile/modals/change-phone/profile-change-phone.html',
        controller: 'ChangePhoneController',
        bindToController: true,
        controllerAs: 'ctrl'
      }).result.then(function (phoneNumber) {
        vm.model.phone = phoneNumber;
      });
    }

    /*****************************
     *** Controller Properties ***
     *****************************/
    vm.removeImage = confirmRemovePicture;
    vm.setImage = setImage;
    /*****************************
     ***** Controller Methods ****
     *****************************/

    /**
     * Loads the selected image and updates the user picture. Opens a crop modal in any browser except Safari
     *
     * @param {any} event
     */
    function setImage(event) {
      vm.uploadedFile = event.currentTarget.files[0];
      if ($rootScope.deviceDetector.browser === 'safari') {
        // Uploads the selected image
        var request = NstSvcStore.uploadWithProgress(vm.uploadedFile, function () {
        }, NST_STORE_UPLOAD_TYPE.PROFILE_PIC, NstSvcAuth.lastSessionKey);

        request.finished().then(function (response) {
          // Sets picture as the user profile avatar
          return NstSvcUserFactory.updatePicture(vm.model.id, response.data.universal_id);
        }).then(function (user) {
          // Updates the model
          vm.model = user;
          // And updates the authenticated user model in `NstSvcAuth`
          NstSvcAuth.setUser(user);
        });
      } else {
        $uibModal.open({
          animation: false,
          size: 'no-miss crop',
          templateUrl: 'app/settings/profile/crop/change-pic.modal.html',
          controller: 'CropController',
          resolve: {
            argv: {
              file: vm.uploadedFile
            }
          },
          controllerAs: 'ctlCrop'
        }).result.then(function (croppedFile) {
          var imageLoadTimeout = null;
          vm.uploadedFile = croppedFile;
          var reader = new FileReader();
          reader.onload = function (event) {
            imageLoadTimeout = $timeout(function () {
              // DIsplays the cropped image before upload starts
              vm.picture = event.target.result;
              // Uploads the cropped image
              var request = NstSvcStore.uploadWithProgress(vm.uploadedFile, function () {
              }, NST_STORE_UPLOAD_TYPE.PROFILE_PIC, NstSvcAuth.lastSessionKey);

              request.finished().then(function (response) {
                // Sets picture as the user profile avatar
                return NstSvcUserFactory.updatePicture(vm.model.id, response.data.universal_id);
              }).then(function (user) {
                // Updates the model
                vm.model = user;
                // And updates the authenticated user model in `NstSvcAuth`
                NstSvcAuth.setUser(user);
              });


            });
          };
          reader.readAsDataURL(croppedFile);
        }).catch(function () {
          event.target.value = '';
        });

      }
    }

    /**
     * Asks the user to confirm before removing the account picture
     *
     */
    function confirmRemovePicture() {
      NstSvcModal.confirm(NstSvcTranslation.get("Removing profile picture"),
        NstSvcTranslation.get("Please make sure before removing the picture of your profile")).then(function (result) {
        if (result) {
          removePicture();
        }
      });

    }


    /**
     * Removes the authenticated user's profile picture and updates
     * the model in both the controller and `NstSvcAuth`
     *
     * @returns
     */
    function removePicture() {
      var deferred = $q.defer();
      NstSvcUserFactory.removePicture(vm.model.id).then(function (user) {
        vm.model = user;
        NstSvcAuth.setUser(user);
        deferred.resolve();
      }).catch(deferred.reject);

      return deferred.promise;
    }


  }
})();
