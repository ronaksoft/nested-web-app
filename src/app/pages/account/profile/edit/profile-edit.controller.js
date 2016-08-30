(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ProfileEditController', ProfileEditController);

  /** @ngInject */
  function ProfileEditController($rootScope, $state, $q, $uibModal, $timeout, $log,
                                 toastr,
                                 NST_STORE_UPLOAD_TYPE, NST_DEFAULT,
                                 NstSvcLoader, NstSvcAuth, NstSvcStore, NstSvcUserFactory, NstVmNavbarControl,NST_NAVBAR_CONTROL_TYPE) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.status = {
      saveInProgress: false
    };

    vm.controls = {
      left: [],
      right: []
    };

    vm.userModel = NstSvcAuth.getUser();

    vm.model = {
      id: '',
      firstName: '',
      lastName: '',
      fullName: '',
      phone: '',
      picture: {
        id: '',
        file: null,
        url: '',
        request: null,
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

    vm.imgToUri = function (event) {
      var element = event.currentTarget;
      var reader = new FileReader();

      vm.model.picture.id = '';
      vm.model.picture.file = element.files[0];
      reader.onload = function (event) {
        $timeout(function () {
          vm.model.picture.url = event.target.result;
        });
      };

      reader.readAsDataURL(vm.model.picture.file);
    };

    vm.removeImg = function () {
      if (vm.model.picture.request) {
        NstSvcStore.cancelUpload(vm.model.picture.request);
      }

      $timeout(function () {
        vm.model.picture.id = '';
        vm.model.picture.file = null;
        vm.model.picture.url = '';
      });

    };

    vm.changeState = function (event, toState, toParams, fromState, fromParams, cancel) {
      if (vm.model.saved || !vm.model.isModified()) {
        cancel.$destroy();
        $state.go(toState.name, toParams);
      } else {
        if (!$rootScope.modals['leave-confirm']) {
          $rootScope.modals['leave-confirm'] = $uibModal.open({
            animation: false,
            templateUrl: 'app/modals/leave-confirm/main.html',
            controller: 'LeaveConfirmController',
            controllerAs: 'ctlLeaveConfirm',
            size: 'sm',
            resolve: {

            }
          });

          $rootScope.modals['leave-confirm'].result.then(function () {
            cancel.$destroy();
            $state.go(toState.name, toParams);
          });
        }
      }
    };

    vm.model.isModified = function () {
      vm.model.fullName = vm.model.firstName + ' ' + vm.model.lastName;
      vm.model.modified = (function (model) {
        var modified = false;

        modified = modified || model.firstName.trim().length > 0;
        modified = modified || model.lastName.trim().length > 0;
        modified = modified || model.picture.file;

        return modified;
      })(vm.model);

      return vm.model.modified;
    };

    // TODO: Call this while model is changed
    vm.model.check = function () {
      vm.model.isModified();

      vm.model.errors = (function (model) {
        var errors = [];

        if (0 == model.firstName.trim().length) {
          errors.push({
            name: 'firstname',
            message: 'First Name is Empty'
          });
        }

        if (0 == model.lastName.trim().length) {
          errors.push({
            name: 'lastname',
            message: 'Last Name is Empty'
          });
        }

        if (vm.model.picture.request) {
          errors.push({
            name: 'picture',
            message: 'Picture uploading has not been finished yet'
          });
        }

        return errors;
      })(vm.model);

      vm.model.ready = 0 == vm.model.errors.length;

      return vm.model.ready;
    };

    vm.save = function () {
      return NstSvcLoader.inject((function () {
        var deferred = $q.defer();

        if (vm.model.saving) {
          deferred.reject([{
            name: 'saving',
            message: 'Already is being saved'
          }]);
        } else {
          if (vm.model.check()) {
            vm.model.saving = true;

            var user = vm.userModel;
            var qPicture = $q.defer();


            //TODO:: Move to Auth Service
            if (vm.model.picture.id || !vm.model.picture.file) {
              user.getPicture().setId(vm.model.picture.id);
              qPicture.resolve(user);
            } else {
              vm.model.picture.request = NstSvcStore.uploadWithProgress(vm.model.picture.file, function (event) {
                if (event.lengthComputable) {
                  vm.model.picture.uploadedSize = event.loaded;
                  vm.model.picture.uploadedRatio = Number(event.loaded / event.total).toFixed(4);
                }
              }, NST_STORE_UPLOAD_TYPE.PROFILE_PICTURE);

              vm.model.picture.request.sent().then(function () {
                vm.model.picture.isUploading = true;
              });

              vm.model.picture.request.finished().then(function () {
                vm.model.picture.isUploading = false;
                vm.model.picture.request = null;
              });

              vm.model.picture.request.getPromise().then(function (response) {
                vm.model.picture.id = response.data.universal_id;
                user.getPicture().setId(vm.model.picture.id);
                qPicture.resolve(user);
              }).catch(qPicture.reject);
            }


            $q.all([qPicture.promise]).then(function () {
              user.setFirstName(vm.model.firstName);
              user.setLastName(vm.model.lastName);

              return reqUpdateUser(user);
            }).then(deferred.resolve).catch(function (error) { deferred.reject([error]); });
          } else {
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (user) {
        vm.model.saving = false;
        vm.model.saved = true;

        toastr.success('Your profile has been successfully updated.', 'Profile Updated');
        $state.go(NST_DEFAULT.STATE);

        return $q(function (res) {
          res(user);
        });
      }).catch(function (errors) {
        vm.model.saving = false;
        toastr.error(errors.filter(
          function (v) { return !!v.message; }
        ).map(
          function (v, i) { return String(Number(i) + 1) + '. ' + v.message; }
        ).join("<br/>"), 'Profile Update Error');

        $log.debug('Profile Update | Error Occurred: ', errors);

        return $q(function (res, rej) {
          rej(errors);
        });
      }));
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    (function () {
      vm.model.id = vm.userModel.getId();
      vm.model.firstName = vm.userModel.getFirstName();
      vm.model.lastName = vm.userModel.getLastName();
      vm.model.fullName = vm.userModel.getFullName();
      vm.model.phone = vm.userModel.getPhone();

      if (vm.userModel.getPicture().getId()) {
        vm.model.picture.id = vm.userModel.getPicture().getId();
        vm.model.picture.url = vm.userModel.getPicture().getLargestThumbnail().getUrl().view;
      }
    })();

    /*****************************
     *****   Request Methods  ****
     *****************************/

    function reqUpdateUser(user) {
      vm.status.saveInProgress = true;

      return NstSvcLoader.inject(NstSvcUserFactory.save(user)).then(function (newUser) {
        vm.status.saveInProgress = false;

        return $q(function (res) {
          res(newUser);
        });
      }).catch(function (error) {
        vm.status.saveInProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
      });
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    function mapUser(user) {
      return {
        id : user.getId(),
        avatar : user.getPicture().getThumbnail(128).getUrl().view,
        fname : user.getFirstName(),
        lname : user.getLastName(),
        phone : user.getPhone()
      };
    }
  }
})();
