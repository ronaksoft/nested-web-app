(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('EditProfileController', EditProfileController);

  /** @ngInject */
  function EditProfileController($rootScope, $scope, $stateParams, $state, $q, $uibModal, $timeout, $log, $window,
                                 toastr, moment,
                                 NST_STORE_UPLOAD_TYPE, NST_USER_FACTORY_EVENT, NST_NAVBAR_CONTROL_TYPE, NstPicture, NST_PATTERN,
                                 NstSvcAuth, NstSvcStore, NstSvcUserFactory, NstUtility, NstSvcTranslation, NstSvcI18n, NstFactoryEventData) {
    var vm = this;

    vm.model = NstSvcUserFactory.currentUser;

    vm.updateName = updateName;
    vm.updateGender = updateGender;
    vm.updateSearchable = updateSearchable;
    vm.updateDateOfBirth = updateDateOfBirth;
    vm.updateEmail = updateEmail;
    vm.updateSearchable = updateSearchable;
    vm.getGender = getGender;
    vm.emailPattern = NST_PATTERN.EMAIL;


    vm.genders = [
      {key: '', title: ''},
      {key: 'm', title: NstSvcTranslation.get("Male")},
      {key: 'f', title: NstSvcTranslation.get("Female")},
      {key: 'o', title: NstSvcTranslation.get("Other")}
    ];

    vm.minDateOfBirth = moment().subtract(100, "year").format("YYYY-MM-DD");
    vm.maxDateOfBirth = moment().format("YYYY-MM-DD");

    (function () {
      vm.loadProgress = true;
      NstSvcUserFactory.get(vm.model.id, true).then(function (user) {
        vm.model = user;
      }).catch(function (error) {
        toastr.error('An error has occured while retrieving user profile')
      }).finally(function () {
        vm.loadProgress = false;
      });

    })();


    function update(params) {
      var deferred = $q.defer();

      vm.updateProgress = true;
      NstSvcUserFactory.update(params).then(function () {
        NstSvcUserFactory.get(vm.user.id,true).then(function (user) {
          NstSvcUserFactory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, new NstFactoryEventData(user)));
        });

        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Sorry, an error has occurred while updating your profile."));
        deferred.reject();
      }).finally(function () {
        vm.updateProgress = false;
      });

      return deferred.promise;
    }

    function updateName(isValid, firstName, lastName, $close, $dismiss) {
      if (!isValid) {
        return;
      }

      return update({
        'firstName' : firstName,
        'lastName' : lastName
      }).then(function () {
        vm.model.firstName = firstName;
        vm.model.lastName = lastName;
        $close();
      });
    }

    function updateDateOfBirth(isValid, value, $close, $dismiss) {
      if (!isValid) {
        return;
      }

      return update({
        'dateOfBirth' : value
      }).then(function () {
        vm.model.dateOfBirth = value;
        $close();
      });
    }

    function updateEmail(isValid, value, $close, $dismiss) {
      if (!isValid) {
        return;
      }

      return update({
        'email' : value
      }).then(function () {
        vm.model.email = value;
        $close();
      });
    }

    function updateGender(isValid, value, $close) {
      if (!isValid) {
        return;
      }

      return update({
        'gender' : value
      }).then(function () {
        vm.model.gender = value;
        $close();
      });
    }

    function updateSearchable(value) {
      return update({
        'searchable' : value
      }).then(function () {
        vm.model.searchable = value;
      });
    }

    function getGender() {
      var selected = _.find(vm.genders, { key : vm.model.gender });

      return selected ? selected.title : vm.genders[0].title;
    }
    /*****************************
     *** Controller Properties ***
     *****************************/
    vm.removeImage = removePicture;
    vm.setImage = setImage;
    var imageLoadTimeout = null;


    /*****************************
     ***** Controller Methods ****
     *****************************/

    function setImage(event) {

      vm.uploadedFile = event.currentTarget.files[0];


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
        vm.uploadedFile = croppedFile;
        var reader = new FileReader();
        reader.onload = function (event) {
          imageLoadTimeout = $timeout(function () {
            vm.picture = event.target.result;
            var request = NstSvcStore.uploadWithProgress(vm.uploadedFile, function (event) {}, NST_STORE_UPLOAD_TYPE.PROFILE_PICTURE);

            request.finished().then(function (response) {
              return NstSvcUserFactory.updatePicture(response.data.universal_id, vm.user.id);
            }).then(function (res) {
              NstSvcUserFactory.get(vm.user.id,true).then(function (user) {
                vm.model = user;
              })
            });


          });
        };
        reader.readAsDataURL(croppedFile);
      }).catch(function() {
        event.target.value = '';
      });


    }


    function removePicture() {
      var deferred = $q.defer();

      NstSvcUserFactory.removePicture().then(function (result) {
        vm.model.clearPicture();
        NstSvcUserFactory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PROFILE_UPDATED, new NstFactoryEventData(vm.model)));
        NstSvcUserFactory.dispatchEvent(new CustomEvent(NST_USER_FACTORY_EVENT.PICTURE_UPDATED, new NstFactoryEventData(vm.model)));

        deferred.resolve();
      }).catch(function (error) {
        deferred.reject();
      });

      return deferred.promise;
    }


  }
})();
