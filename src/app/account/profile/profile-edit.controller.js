(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('ProfileEditController', ProfileEditController);

  /** @ngInject */
  function ProfileEditController($rootScope, $scope, $stateParams, $state, $q, $uibModal, $timeout, $log, $window,
                                 toastr, moment,
                                 NST_STORE_UPLOAD_TYPE, NST_DEFAULT, NST_NAVBAR_CONTROL_TYPE, NstPicture,
                                 NstSvcLoader, NstSvcAuth, NstSvcStore, NstSvcUserFactory, NstVmNavbarControl, NstUtility, NstSvcTranslation, NstSvcI18n, NstSvcPlaceFactory) {
    var vm = this;
    var imageLoadTimeout = null;

    /*****************************
     *** Controller Properties ***
     *****************************/
    vm.saveAndExit = saveAndExit;
    vm.removeImage = removeImage;
    vm.setImage = setImage;
    vm.changePassword = changePassword;
    vm.setLanguage = setLanguage;

    vm.status = {
      saveInProgress: false
    };

    vm.controls = {
      left: [],
      right: []
    };

    vm.genders = [
      {key: 'm', title: NstSvcTranslation.get("Male")},
      {key: 'f', title: NstSvcTranslation.get("Female")},
      {key: 'o', title: NstSvcTranslation.get("Other")}
    ];

    vm.model = {
      id: null,
      firstName: '',
      lastName: '',
      phone: '',
      gender: 'm',
      dateOfBirth: null,
      country: null,
      searchable: null,
      picture: {
        id: '',
        file: null,
        url: '',
        remove: false,
        isUploading: false,
        uploadedSize: 0,
        uploadedRatio: 0
      },
      errors: [],
      modified: false,
      ready: false,
      saving: false,
      saved: false
    };

    vm.lang = NstSvcI18n.selectedLocale;

    /*****************************
     ***** Controller Methods ****
     *****************************/
    vm.uploadedImage = false;

    function setImage(event) {
      vm.uploadedImage = true;
      // var element = event.currentTarget;


      vm.model.picture.id = '';
      vm.model.picture.uploadedFile = event.currentTarget.files[0];
      // vm.model.picture.uploadedFileName = element.files[0].name;
      vm.model.picture.remove = false;

      var reader = new FileReader();
      reader.onload = function (event) {
        imageLoadTimeout = $timeout(function () {
          vm.model.picture.uploaded = event.target.result;

        });
      };
      reader.readAsDataURL(vm.model.picture.uploadedFile);
    }

    $scope.$watch(function () {
      return vm.model.picture.url;
    }, function () {
      if (vm.model.picture.url) {
        var file = dataURItoFile(vm.model.picture.url,'profile_image');
        vm.model.picture.uploadedFile = file;
      }
    });

    function dataURItoFile(dataURI, filename) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = decodeURI(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new File([ia], filename + '.' +  mimeString.split('/')[1], {type: mimeString});
    }

    function removeImage() {
      if (vm.model.picture.request) {
        NstSvcStore.cancelUpload(vm.model.picture.request);
      }

      vm.model.picture.id = '';
      vm.model.picture.file = null;
      vm.model.picture.url = '';
      vm.model.picture.remove = true;
    }

    (function () {
      NstSvcUserFactory.get().then(function (user) {

        vm.model.id = user.getId();
        vm.model.firstName = user.getFirstName();
        vm.model.lastName = user.getLastName();
        vm.model.fullName = user.getFullName();
        vm.model.phone = user.getPhone();
        vm.model.dateOfBirth = new Date(user.getDateOfBirth());
        vm.model.gender = user.getGender();
        vm.model.country = user.getCountry();

        if (user.hasPicture()) {
          vm.model.picture.id = user.picture.original;
          vm.model.picture.url = user.picture.getUrl("x128");
        }

        return NstSvcPlaceFactory.get(user.id);
      }).then(function (place) {
        console.log(place);
        vm.model.searchable = place.privacy.search;
      }).catch(function (error) {
        $log.debug(error);
      });

    })();


    function storePicture(file, viewModel) {
      var deferred = $q.defer();

      var request = NstSvcStore.uploadWithProgress(file, function (event) {
        if (event.lengthComputable) {
          viewModel.picture.uploadedSize = event.loaded;
          viewModel.picture.uploadedRatio = Number(event.loaded / event.total).toFixed(4);
        }
      }, NST_STORE_UPLOAD_TYPE.PROFILE_PICTURE);

      request.sent().then(function () {
        viewModel.picture.isUploading = true;
      });

      request.finished().then(function () {
        viewModel.picture.isUploading = false;
      });

      request.getPromise().then(function (response) {
        deferred.resolve(new NstPicture(response.data.thumbs));
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function removePicture() {
      var deferred = $q.defer();

      NstSvcUserFactory.removePicture().then(deferred.resolve).catch(deferred.reject);

      return deferred.promise;
    }

    function updateModel(viewModel) {
      var deferred = $q.defer();
      NstSvcUserFactory.get(viewModel.id).then(function (user) {

        user.firstName = viewModel.firstName;
        user.lastName = viewModel.lastName;
        user.phone = viewModel.phone;
        user.gender = viewModel.gender;
        user.dateOfBirth = viewModel.dateOfBirth;
        user.country = viewModel.country;

        return $q.all([
          NstSvcUserFactory.updateProfile(user),
          NstSvcPlaceFactory.update(user.id, { 'privacy.search' : viewModel.searchable })
        ]);
      }).then(function (resultSet) {
        deferred.resolve(resultSet[0]);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function save(isValid) {
      vm.submitted = true;

      if (!isValid) {
        return;
      }

      var deferred = $q.defer();

      NstSvcLoader.inject(deferred.promise);

      updateModel(vm.model).then(function (user) {

        vm.model.fullName = user.getFullName();
        var uploadedPicture = null;
        if (vm.uploadedImage) {
          storePicture(vm.model.picture.uploadedFile, vm.model).then(function (picture) {
            uploadedPicture = picture;
            return NstSvcUserFactory.updatePicture(picture.original);
          }).then(function (pictureId) {

            vm.model.picture = uploadedPicture;
            deferred.resolve(user);
          }).catch(deferred.reject);
        } else if (vm.model.picture.remove) {
          removePicture().then(function () {
            user.picture = new NstPicture();
            deferred.resolve(user);
          }).catch(deferred.reject);
        } else {
          deferred.resolve(user);
        }

      }).catch(deferred.reject);

      return deferred.promise;
    }

    function saveAndExit(isValid) {
      save(isValid).then(function (result) {

        $rootScope.goToLastState();
        if (isSelectedLocale(vm.lang)) {
          toastr.success(NstSvcTranslation.get("Your profile has been updated."));
        } else {
          setLanguage(vm.lang);
          window.location.reload(true);
        }

      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Sorry, an error has occurred while updating your profile."));
      });
    }

    function changePassword() {
      $state.go('app.change-password');
    }

    function setLanguage(lang) {
      NstSvcI18n.setLocale(lang);
    }

    function isSelectedLocale(locale) {
      return NstSvcI18n.selectedLocale === locale;
    }

    $scope.$on('$destroy', function () {
      $timeout.cancel(imageLoadTimeout);
    });
  }
})();
