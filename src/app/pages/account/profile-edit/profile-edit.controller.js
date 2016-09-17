(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ProfileEditController', ProfileEditController);

  /** @ngInject */
  function ProfileEditController($scope, $stateParams, $state, $q, $uibModal, $timeout, $log, $window,
    toastr, PreviousState,
    NST_STORE_UPLOAD_TYPE, NST_DEFAULT,  NST_NAVBAR_CONTROL_TYPE, NstPicture,
    NstSvcLoader, NstSvcAuth, NstSvcStore, NstSvcUserFactory, NstVmNavbarControl, NstUtility ) {
    var vm = this;


    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.save = save;
    vm.removeImage = removeImage;
    vm.setImage = setImage;
    vm.changePassword = changePassword;

    vm.status = {
      saveInProgress: false
    };

    vm.controls = {
      left: [
        new NstVmNavbarControl('Discard', NST_NAVBAR_CONTROL_TYPE.BUTTON, null, function () {
          $state.go(NST_DEFAULT.STATE);
        })
      ],
      right: []
    };

    vm.genders = [
      {key : 'm', title : 'Male'},
      {key : 'f', title : 'Female'},
      {key : 'o', title : 'Other'}
    ];

    vm.model = {
      id: null,
      firstName: '',
      lastName: '',
      phone: '',
      gender: 'm',
      dateOfBirth : null,
      country : null,
      picture: {
        id: '',
        file: null,
        url: '',
        remove : false,
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

    /*****************************
     ***** Controller Methods ****
     *****************************/
    vm.uploadedImage = false;
    function setImage(event) {
      vm.uploadedImage = true;
      var element = event.currentTarget;
      var reader = new FileReader();

      vm.model.picture.id = '';
      vm.model.picture.uploadedFile = element.files[0];
      vm.model.picture.uploadedFileName = element.files[0].name;
      vm.model.picture.remove = false;

      reader.onload = function(event) {
        $timeout(function() {
          vm.model.picture.uploaded = event.target.result;
        });
      };
      reader.readAsDataURL(vm.model.picture.uploadedFile);
    }

    $scope.$watch(function(){
      return vm.model.picture.url;
    },function () {
      urltoFile(vm.model.picture.url, vm.model.picture.uploadedFileName, 'image/jpg')
        .then(function(file){
          vm.model.picture.file = file
        })
    });

    function urltoFile(url, filename, mimeType){
      return (fetch(url)
          .then(function(res){return res.arrayBuffer();})
          .then(function(buf){return new File([buf], filename, {type:mimeType});})
      );
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

    (function() {
      var userPromise = NstSvcUserFactory.get();
      NstSvcLoader.inject(userPromise);

      userPromise.then(function(user) {

        vm.model.id = user.getId();
        vm.model.firstName = user.getFirstName();
        vm.model.lastName = user.getLastName();
        vm.model.fullName = user.getFullName();
        vm.model.phone = user.getPhone();
        vm.model.dateOfBirth = new Date(user.getDateOfBirth());
        vm.model.gender = user.getGender();
        vm.model.country = user.getCountry();

        if (user.getPicture().getId()) {
          vm.model.picture.id = user.getPicture().getId();
          vm.model.picture.url = user.getPicture().thumbnails.x128.url.view;
        }
      }).catch(function(error) {
        $log.debug(error);
      });

    })();


    function storePicture(file, viewModel) {
      var deferred = $q.defer();

      var request = NstSvcStore.uploadWithProgress(file, function(event) {
        if (event.lengthComputable) {
          viewModel.picture.uploadedSize = event.loaded;
          viewModel.picture.uploadedRatio = Number(event.loaded / event.total).toFixed(4);
        }
      }, NST_STORE_UPLOAD_TYPE.PROFILE_PICTURE);

      request.sent().then(function() {
        viewModel.picture.isUploading = true;
      });

      request.finished().then(function() {
        viewModel.picture.isUploading = false;
      });

      request.getPromise().then(function(response) {
        var id = response.data.universal_id;
        deferred.resolve(id);
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
      NstSvcUserFactory.get(viewModel.id).then(function(user) {

        user.firstName = viewModel.firstName;
        user.lastName = viewModel.lastName;
        user.phone = viewModel.phone;
        user.gender = viewModel.gender;
        user.dateOfBirth = moment(viewModel.dateOfBirth).startOf('date').format('YYYY-MM-DD');
        user.country = viewModel.country;

        return NstSvcUserFactory.updateProfile(user);
      }).then(function(user) {
        deferred.resolve(user);
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

      updateModel(vm.model).then(function(user) {

        vm.model.fullName = user.getFullName();

        if (vm.model.picture.file) {
          storePicture(vm.model.picture.file, vm.model).then(function(storeId) {

            return NstSvcUserFactory.updatePicture(storeId);
          }).then(function (pictureId) {
            vm.model.picture.id = pictureId;
            user.getPicture().setId(pictureId);
            user.getPicture().setThumbnail(32, user.getPicture().getOrg());
            user.getPicture().setThumbnail(64, user.getPicture().getOrg());
            user.getPicture().setThumbnail(128, user.getPicture().getOrg());

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

    function changePassword() {
      $state.go('change-password');
    }
  }
})();
