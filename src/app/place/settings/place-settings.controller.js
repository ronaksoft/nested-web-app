(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($scope, $stateParams, $q, $state, $rootScope,
    $timeout, $uibModal, $uibModalInstance, toastr,
    NST_PLACE_POLICY_OPTION, NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_SRV_ERROR,
    NST_PLACE_MEMBER_TYPE, NST_PLACE_FACTORY_EVENT, NST_PLACE_TYPE, NST_DEFAULT,
    NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstSvcLogger, NstSvcTranslation, NstSvcModal,
    NstPicture, NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError) {
    var vm = this;
    $scope.NST_PLACE_POLICY_OPTION = NST_PLACE_POLICY_OPTION;
    $scope.NST_PLACE_TYPE = NST_PLACE_TYPE;

    /*****************************
     *** Controller Properties ***
     *****************************/
    vm.place = null;
    vm.placeType = null;
    vm.accesses = {
      hasRemoveAccess: null,
      hasAddPlaceAccess: null,
      hasControlAccess: null,
      hasAddMembersAccess: null,
      hasSeeMembersAccess: null,
      hasReadAccess: null
    };
    vm.tempPictureUrl = null;
    vm.placeLoadProgress = false;


    vm.setPicture = setPicture;
    vm.removePicture = removePicture;
    vm.leave = confirmToLeave;
    vm.remove = confirmToRemove;

    (function() {
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;

      // do not allow user to view her personal place settings
      // and redirect her to Profile Settings page instead
      if (vm.placeId === vm.user.id) {
        $timeout(function () {
          $uibModalInstance.close();
          $state.go('app.settings.profile');
          toastr.info(NstSvcTranslation.get("You can modify your profile settings here"));
        }, 1);
        return;
      }

      loadPlace(vm.placeId).then(function(result) {
        if (result.accesses.hasReadAccess) {
          vm.place = result.place;
          vm.accesses = result.accesses;
          vm.placeType = getPlaceType(vm.place);
        } else {
          // The place was found but the user does not have READ access
          $timeout(function () {
            $uibModalInstance.close();
            $state.go(NST_DEFAULT.STATE);
            toastr.error(NstUtility.string.format(NstSvcTranslation.get("Either <b>{0}</b> doesn't exist, or you don't have the permit to enter the Place."), result.place.id));
          }, 1);
        }

      }).catch(function(error) {
        switch (error.code) {
          // The place does not exist and the user must be navigated through
          // the app default state
          case NST_SRV_ERROR.UNAVAILABLE:
            $timeout(function () {
              $uibModalInstance.close();
              $state.go(NST_DEFAULT.STATE);
              toastr.error(NstUtility.string.format(NstSvcTranslation.get("Either <b>{0}</b> doesn't exist, or you don't have the permit to enter the Place."), vm.placeId));
            }, 1);
            break;
          default:
            toastr.error(NstSvcTranslation.get("An error has occured while loading the place settings."));
            break;
        }
      });


      $rootScope.$on('member-removed', function(event, data) {
        switch (data.member.role) {
          case NST_PLACE_MEMBER_TYPE.CREATOR:
            vm.place.counters.creators--;
            break;
          case NST_PLACE_MEMBER_TYPE.KEY_HOLDER:
            vm.place.counters.key_holders--;
            break;
          default:
            NstSvcLogger.error(NstUtility.string.format('Can not remove the member, Because her role is "{0}" which was not expected!', data.previousRole));
            break;

        }
      });
    })();


    function getPlaceType(place) {
      if (NstUtility.place.isGrand(place.id)) {

        return NST_PLACE_TYPE.GRAND;
      } else if (NstUtility.place.getGrandId(place.id) === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.SUB_PERSONAL;
      } else if (place.privacy.locked) {

        return NST_PLACE_TYPE.PRIVATE;
      } else if (!place.privacy.locked) {

        return NST_PLACE_TYPE.COMMON;
      } else if (place.id === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.PERSONAL;

      } else {

        throw Error("Could not figure out place type");
      }
    }

    function loadPlace(id) {
      var deferred = $q.defer(),
        result = {
          place: null,
          accesses: {}
        };

      vm.placeLoadProgress = true;
      NstSvcPlaceFactory.get(id).then(function (place) {

        result.place = place;

        result.accesses.hasRemoveAccess = place.hasAccess(NST_PLACE_ACCESS.REMOVE_PLACE);
        result.accesses.hasAddPlaceAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_PLACE);
        result.accesses.hasControlAccess = place.hasAccess(NST_PLACE_ACCESS.CONTROL);
        result.accesses.hasAddMembersAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
        result.accesses.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);
        result.accesses.hasReadAccess = place.hasAccess(NST_PLACE_ACCESS.READ);

        vm.placeLoadProgress = false;

        deferred.resolve(result);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function setPicture(event) {
      var file = event.currentTarget.files[0];


      $uibModal.open({
        animation: false,
        size: 'no-miss crop',
        templateUrl: 'app/settings/profile/crop/change-pic.modal.html',
        controller: 'CropController',
        resolve: {
          argv: {
            file: file,
            type: 'square'
          }
        },
        controllerAs: 'ctlCrop'
      }).result.then(function (croppedFile) {
        vm.logoFile = croppedFile;
        vm.logoUrl = '';

        var reader = new FileReader();
        reader.onload = function (readEvent) {
          NstSvcLogger.info('The picture is loaded locally and going to be sent to server.');
          vm.logoUrl = readEvent.target.result;

          // upload the picture
          var request = NstSvcStore.uploadWithProgress(vm.logoFile, logoUploadProgress, NST_STORE_UPLOAD_TYPE.PLACE_PICTURE);

          request.getPromise().then(function (result) {

            NstSvcPlaceFactory.updatePicture(vm.place.id, result.data.universal_id).then(function (result) {
              NstSvcLogger.info(NstUtility.string.format('Place {0} picture updated successfully.', vm.place.id));
              toastr.success(NstSvcTranslation.get("The Place photo has been set successfully."));
            }).catch(function (error) {
              NstSvcLogger.error(error);
              toastr.error(NstSvcTranslation.get("An error has occurred in updating the Place photo."));
            });

            vm.place.picture = new NstPicture(result.data.thumbs);
            // vm.tempPictureUrl = null;
          });
        };

        reader.readAsDataURL(vm.logoFile);
      }).catch(function () {
        event.target.value = '';
      });

    }

    function logoUploadProgress(event) {
      vm.logoUploadedSize = event.loaded;
      vm.logoUploadedRatio = Number(event.loaded / event.total).toFixed(4);

      NstSvcLogger.error(NstUtility.string.format('Upload progress : {0}%', vm.logoUploadedRatio));
    }

    function confirmToLeave() {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-leave-confirm.html',
        size: 'sm',
        controller : 'PlaceLeaveConfirmController',
        controllerAs : 'leaveCtrl',
        resolve : {
          selectedPlace: function () {
            return vm.place.name;
          }
        }
      }).result.then(function() {
        leave();
      });
    }

    function leave() {
      NstSvcPlaceFactory.leave(vm.placeId).then(function(result) {
        $timeout(function () {
          $uibModalInstance.close();
          if (_.indexOf(vm.place.id, '.') > -1) {
            $state.go('app.place-messages', { placeId : vm.place.grandParentId });
          } else {
            $state.go(NST_DEFAULT.STATE);
          }
        }, 1);

      }).catch(function(error) {
        if (error instanceof NstPlaceOneCreatorLeftError){
          toastr.error(NstSvcTranslation.get('You are the only one left!'));
        } else if (error instanceof NstPlaceCreatorOfParentError) {
          toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to leave the Place because you are the creator of its highest-ranking Place ({0}).'), vm.place.parent.name));
        }
        NstSvcLogger.error(error);
      });

    }

    function confirmToRemove() {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-delete.html',
        controller: 'PlaceRemoveConfirmController',
        controllerAs: 'removeCtrl',
        size: 'sm',
        resolve: {
          selectedPlace: function() {
            return vm.place;
          }
        }
      }).result.then(function(confirmResult) {
        remove();
      });
    }

    function remove() {
      NstSvcPlaceFactory.remove(vm.place.id).then(function(removeResult) {
        toastr.success(NstUtility.string.format(NstSvcTranslation.get("Place {0} was removed successfully."), vm.place.name));
        $timeout(function () {
          $uibModalInstance.close();
          if (_.indexOf(vm.place.id, '.') > -1) {
            $state.go('app.place-messages', { placeId : vm.place.grandParentId });
          } else {
            $state.go(NST_DEFAULT.STATE);
          }
        }, 1);

      }).catch(function(error) {
        if (error.code === 1 && error.message[0] === "remove_children_first") {
          toastr.warning(NstSvcTranslation.get("You have to delete all the sub-Places within, before removing this Place."));
        } else {
          toastr.error(NstSvcTranslation.get("An error has occurred in removing this Place."));
        }
      });
    }

    function removePicture() {
      NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("Please make sure before removing the place picture.")).then(function(confirmed) {
        NstSvcPlaceFactory.updatePicture(vm.place.id, "").then(function (result) {
          vm.place.picture = null;
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get("An error occured while removing the place picture"));
        });
      });
    }

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.BOOKMARK_ADD, function (e) {
      if (e.detail.id === vm.placeId) vm.options.bookmark = true;
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.BOOKMARK_REMOVE, function (e) {
      if (e.detail.id === vm.placeId) vm.options.bookmark = false;
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.NOTIFICATION_ON, function (e) {
      if (e.detail.id === vm.placeId) vm.options.notification = true;
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.NOTIFICATION_OFF, function (e) {
      if (e.detail.id === vm.placeId) vm.options.notification = false;
    });

  }
})();
