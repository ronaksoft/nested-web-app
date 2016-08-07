(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceAddController', PlaceAddController);

  /** @ngInject */
  function PlaceAddController($q, $timeout, $scope, $uibModal, $state, $stateParams, $log,
                              toastr,
                              NST_DEFAULT, NST_SRV_ERROR, NST_STORE_UPLOAD_TYPE, NST_NAVBAR_CONTROL_TYPE, NST_PLACE_ACCESS,
                              NstSvcStore, NstSvcLoader, NstSvcTry, NstSvcPlaceFactory,
                              NstVmNavbarControl, NstLocalResource, NstPlace) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.status = {
      accessCheckProgress: false
    };

    vm.model = {
      parentId: '',
      id: '',
      name: '',
      description: '',
      picture: {
        id: '',
        url: '/assets/icons/absents_place.svg'
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

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.place.picture.org.url = event.target.result;
        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.removeImg = function () {
      $scope.place.picture.org.url = null;
      $scope.place.picture.org.uid = null;
    };

    vm.create = function () {
      var p = $scope.logo ? NstSvcStore.upload($scope.logo, NST_STORE_UPLOAD_TYPE.PLACE_PICTURE) : $q(function (res) { res(); });

      NstSvcLoader.inject(p.then(function (response) {
        if (!$scope.place.picture.org.uid) {
          $scope.place.picture.org.uid = response ? response.universal_id : undefined;
          $scope.logo = null;
        }

        return $scope.place.update().then(function (place) {
          $scope.leaveReason = 'Create Place';
          $state.go('place-messages', { placeId: place.id });
        }).catch(function (error) {
          switch (error.err_code) {
            case NST_SRV_ERROR.ACCESS_DENIED:
              break;

            case NST_SRV_ERROR.INVALID:
              // TODO: Enable error message tooltips on view
              for (var k in error.items) {
                switch (error.items[k]) {
                  case 'place_id':
                    $scope.place.id = null;
                    break;

                  case 'place_name':
                    $scope.place.name = null;
                    break;

                  case 'place_desc':
                    $scope.place.description = null;
                    break;
                }
              }
              break;

            case NST_SRV_ERROR.DUPLICATE:
              break;

            case NST_SRV_ERROR.LIMIT_REACHED:
              break;

            default:
              break;
          }
        });
      }));
    };

    $scope.changeMe = function ($event, $toState, $toParams, $fromState, $fromParams, $cancel) {
      if ('Create Place' == $scope.leaveReason) {
        $cancel.$destroy();
        $state.go($toState.name);
      } else {
        vm.confirmModal = function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'app/account/profile/confirmprofile.html',
            controller: 'WarningController',
            size: 'sm',
            scope: $scope
          }).result.then(function () {
            $cancel.$destroy();
            $state.go($toState.name);
          }).catch(function () {

          });

          return false;
        };

        vm.confirmModal();
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

      $log.debug('Compose | Model Modified? ', vm.model.modified);

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
            message: 'Already is being sent'
          }]);
        } else {
          if (vm.model.check()) {
            vm.model.saving = true;

            var id = vm.model.id;
            if (vm.model.parentId) {
              id = vm.model.parentId + id;
            }

            var place = NstSvcPlaceFactory.createPlaceModel();
            place.setId(id);
            place.setName(vm.model.name);
            place.setDescription(vm.model.description);
            place.setPicture(vm.model.picture);

            reqCreatePlace(place).then(deferred.resolve).catch(function (error) { deferred.reject([error]); });
          } else {
            deferred.reject(vm.model.errors);
          }
        }

        return deferred.promise;
      })().then(function (place) {
        vm.model.saving = false;
        vm.model.saved = true;

        toastr.success('Place ' + place.getName() + ' has been successfully created.', 'Place Added');
        $state.go('place-messages', { placeId: place.getId() });
      }).catch(function (errors) {
        vm.model.saving = false;
        toastr.error(errors.filter(
          function (v) { return !!v.message; }
        ).map(
          function (v, i) { return String(Number(i) + 1) + '. ' + v.message; }
        ).join("<br/>"), 'Place Add Error');

        $log.debug('Place Add | Error Occurred: ', errors);
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
            $state.go(NST_DEFAULT.STATE).replace();
          });
        }
      }
    })();

    /*****************************
     *****   Request Methods  ****
     *****************************/

    function reqCreatePlace(place) {
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
