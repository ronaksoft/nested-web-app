(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceAddController', PlaceAddController);

  /** @ngInject */
  function PlaceAddController($q, $timeout, $rootScope, $uibModal, $state, $stateParams, $log,
                              toastr,
                              NST_DEFAULT, NST_SRV_ERROR, NST_STORE_UPLOAD_TYPE, NST_NAVBAR_CONTROL_TYPE, NST_PLACE_ACCESS,
                              NstSvcStore, NstSvcLoader, NstSvcTry, NstSvcPlaceFactory,
                              NstVmNavbarControl) {
    var vm = this;
    var ABSENT_PICTURE = '/assets/icons/absents_place.svg';

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.status = {
      accessCheckProgress: false,
      createInProgress: false
    };

    vm.model = {
      parentId: '',
      id: '',
      name: '',
      description: '',
      picture: {
        id: '',
        file: null,
        url: ABSENT_PICTURE,
        request: null,
        isUploading: false,
        uploadedSize: 0,
        uploadedRatio: 0
      },
      privacy: {
        email: false,
        locked: true,
        receptive: false,
        search: false
      },
      errors: [],
      ready: false,
      saving: false,
      saved: false,
      modified: false
    };

    vm.controls = {
      left: [
        new NstVmNavbarControl('Discard', NST_NAVBAR_CONTROL_TYPE.BUTTON_BACK)
      ],
      right: []
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.imgToUri = function (event) {
      var element = event.currentTarget;
      var reader = new FileReader();

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
        vm.model.picture.url = ABSENT_PICTURE;
      });
    };

    vm.changeState = function (event, toState, toParams, fromState, fromParams, cancel) {
      $log.debug('Place Add | Gonna Change State: ', arguments);
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
      vm.model.modified = (function (model) {
        var modified = false;

        modified = modified || model.parentId.trim().length > 0;
        modified = modified || model.id.trim().length > 0;
        modified = modified || model.description.trim().length > 0;
        modified = modified || model.name.length > 0;
        modified = modified || model.picture.id.trim().length > 0;
        modified = modified || model.privacy.email;
        modified = modified || !model.privacy.locked;
        modified = modified || model.privacy.receptive;
        modified = modified || model.privacy.search;

        return modified;
      })(vm.model);

      return vm.model.modified;
    };

    // TODO: Call this while model is changed
    vm.model.check = function () {
      vm.model.isModified();

      vm.model.errors = (function (model) {
        var errors = [];

        if (0 == model.id.trim().length) {
          errors.push({
            name: 'id',
            message: 'Place ID is Empty'
          });
        }

        if (0 == model.name.trim().length) {
          errors.push({
            name: 'name',
            message: 'Place Name is Empty'
          });
        }

        return errors;
      })(vm.model);

      $log.debug('Place Add | Model Checked: ', vm.model.errors);
      vm.model.ready = 0 == vm.model.errors.length;

      return vm.model.ready;
    };

    vm.create = function () {
      return NstSvcLoader.inject((function () {
        var deferred = $q.defer();

        if (vm.model.saving) {
          // TODO: Already being in save process error
          deferred.reject([{
            name: 'saving',
            message: 'Already is being created'
          }]);
        } else {
          if (vm.model.check()) {
            vm.model.saving = true;

            var place = NstSvcPlaceFactory.createPlaceModel();
            var qParent = $q.defer();
            var qPicture = $q.defer();
            var id = vm.model.id;

            if (vm.model.parentId) {
              id = vm.model.parentId + id;

              NstSvcPlaceFactory.get(vm.model.parentId).catch(function () {
                return $q(function (res) {
                  res(NstSvcPlaceFactory.parsePlace({ _id: vm.model.parentId }));
                });
              }).then(function (parent) {
                place.setParent(parent);
                qParent.resolve(place);
              }).catch(qParent.reject);
            } else {
              qParent.resolve(place);
            }

            if (vm.model.picture.file) {
              vm.model.picture.request = NstSvcStore.uploadWithProgress(vm.model.picture.file, function (event) {
                if (event.lengthComputable) {
                  vm.model.picture.uploadedSize = event.loaded;
                  vm.model.picture.uploadedRatio = Number(event.loaded / event.total).toFixed(4);
                }
              }, NST_STORE_UPLOAD_TYPE.PLACE_PICTURE);

              vm.model.picture.request.sent().then(function () {
                vm.model.picture.isUploading = true;
              });

              vm.model.picture.request.finished().then(function () {
                vm.model.picture.isUploading = false;
                vm.model.picture.request = null;
              });

              vm.model.picture.request.getPromise().then(function (response) {
                vm.model.picture.id = response.data.universal_id;
                place.getPicture().setId(vm.model.picture.id);
                qPicture.resolve(place);
              }).catch(qPicture.reject);
            } else {
              qPicture.resolve(place);
            }

            $q.all([qParent.promise, qPicture.promise]).then(function () {
              place.setId(id);
              place.setName(vm.model.name);
              place.setDescription(vm.model.description);
              place.getPrivacy().setLocked(vm.model.privacy.locked);
              place.getPrivacy().setEmail(vm.model.privacy.email);
              place.getPrivacy().setReceptive(vm.model.privacy.receptive);
              place.getPrivacy().setSearch(vm.model.privacy.search);

              return reqCreatePlace(place).catch(function (fault) {
                var deferred = $q.defer();
                var error = {
                  name: '',
                  message: ''
                };

                switch (fault.getCode()) {
                  case NST_SRV_ERROR.ACCESS_DENIED:
                    error.name = 'forbidden';
                    error.message = 'You have no create access in here';
                    break;

                  case NST_SRV_ERROR.INVALID:
                    // TODO: Enable error message tooltips on view
                    var items = [];
                    for (var k in error.items) {
                      switch (error.items[k]) {
                        case 'place_id':
                          items.push('Place ID');
                          break;

                        case 'place_name':
                          items.push('Place Name');
                          break;

                        case 'place_desc':
                          items.push('Place Description');
                          break;
                      }
                    }

                    error.name = 'invalid';
                    error.message = 'Invalid ' + items.join(', ');
                    break;

                  case NST_SRV_ERROR.DUPLICATE:
                    error.name = 'duplicate';
                    error.message = 'Place ID Exists';
                    break;

                  case NST_SRV_ERROR.LIMIT_REACHED:
                    error.name = 'limit';
                    error.message = 'You cannot create more places';
                    break;

                  default:
                    error.name = 'unknown';
                    error.message = fault.getMessage();
                    break;
                }

                deferred.reject(error);

                return deferred.promise;
              });
            }).then(deferred.resolve).catch(function (error) { deferred.reject([error]); });
          } else {
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (place) {
        vm.model.saving = false;
        vm.model.saved = true;

        toastr.success('Place ' + place.getName() + '#' + place.getId() + ' has been successfully created.', 'Place Added');
        $state.go('place-settings', { placeId: place.getId() });

        return $q(function (res) {
          res(place);
        });
      }).catch(function (errors) {
        vm.model.saving = false;
        toastr.error(errors.filter(
          function (v) { return !!v.message; }
        ).map(
          function (v, i) { return String(Number(i) + 1) + '. ' + v.message; }
        ).join("<br/>"), 'Place Add Error');

        $log.debug('Place Add | Error Occurred: ', errors);

        return $q(function (res, rej) {
          rej(errors);
        });
      }));
    };
    vm.controls.right.push(new NstVmNavbarControl('Create', NST_NAVBAR_CONTROL_TYPE.BUTTON_SUCCESS, undefined, vm.create));

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    (function () {
      if ($stateParams.placeId) {
        if (NST_DEFAULT.STATE_PARAM != $stateParams.placeId) {
          reqHasAddAccess($stateParams.placeId).then(function (has) {
            if (has) {
              vm.model.parentId = $stateParams.placeId;
            } else {
              return $q(function (res, rej) {
                rej();
              })
            }
          }).catch(function () {
            $state.go(NST_DEFAULT.STATE);
          });
        }
      }
    })();

    /*****************************
     *****   Request Methods  ****
     *****************************/

    function reqCreatePlace(place) {
      vm.status.createInProgress = true;

      return NstSvcLoader.inject(NstSvcPlaceFactory.save(place)).then(function (newPlace) {
        vm.status.createInProgress = false;

        return $q(function (res) {
          res(newPlace);
        });
      }).catch(function (error) {
        vm.status.createInProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
      });
    }

    function reqHasAddAccess(id) {
      vm.status.accessCheckProgress = true;

      return NstSvcLoader.inject(NstSvcTry.do(function () {
        return NstSvcPlaceFactory.hasAccess(id, NST_PLACE_ACCESS.ADD_PLACE);
      })).then(function (has) {
        vm.status.accessCheckProgress = false;

        return $q(function (res) {
          res(has);
        });
      }).catch(function (error) {
        vm.status.accessCheckProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
      });
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    /*****************************
     *****    Push Methods    ****
     *****************************/

    /*****************************
     *****  Event Listeners   ****
     *****************************/

    /*****************************
     *****   Other Methods    ****
     *****************************/
  }
})();
