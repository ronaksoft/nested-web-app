/**
 * @file src/app/place/settings/activity.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user changes a place settings here. The component wraps `main` and `members` pages
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  /**
   * The user edits a place settings using this page
   *
   * @param {any} $scope
   * @param {any} $stateParams
   * @param {any} $q
   * @param {any} $state
   * @param {any} $rootScope
   * @param {any} $timeout
   * @param {any} $uibModal
   * @param {any} $uibModalInstance
   * @param {any} toastr
   * @param {any} NST_PLACE_POLICY_OPTION
   * @param {any} NST_STORE_UPLOAD_TYPE
   * @param {any} NST_PLACE_ACCESS
   * @param {any} NST_SRV_ERROR
   * @param {any} NST_PLACE_MEMBER_TYPE
   * @param {any} NST_PLACE_TYPE
   * @param {any} NST_DEFAULT
   * @param {any} NST_PLACE_EVENT
   * @param {any} NstSvcStore
   * @param {any} NstSvcAuth
   * @param {any} NstSvcPlaceFactory
   * @param {any} NstUtility
   * @param {any} NstSvcLogger
   * @param {any} NstSvcTranslation
   * @param {any} NstSvcModal
   * @param {any} NstPicture
   * @param {any} NstEntityTracker
   */
  function PlaceSettingsController($scope, $stateParams, $q, $state, $rootScope,
    $timeout, $uibModal, $uibModalInstance, toastr,
    NST_PLACE_POLICY_OPTION, NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_SRV_ERROR,
    NST_PLACE_MEMBER_TYPE, NST_PLACE_TYPE, NST_DEFAULT, NST_PLACE_EVENT,
    NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstSvcLogger, NstSvcTranslation, NstSvcModal,
    NstPicture, NstEntityTracker) {
    var vm = this;
    $scope.NST_PLACE_POLICY_OPTION = NST_PLACE_POLICY_OPTION;
    $scope.NST_PLACE_TYPE = NST_PLACE_TYPE;
    // Remove-Member and Add-Member should be tracked
    var removedMembersTracker = new NstEntityTracker(10);
    var addedMembersTracker = new NstEntityTracker(10);
    var eventReferences = [];
    var timeoutReferences = [];

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
      vm.tab = $stateParams.tab || 'info';
      vm.user = NstSvcAuth.user;
      $scope.selectedView = vm.tab === 'members' ? 1 : 0;

      // do not allow user to view her personal place settings
      // and redirect her to Profile Settings page instead
      if (vm.placeId === vm.user.id) {
        timeoutReferences.push($timeout(function () {
          $uibModalInstance.close();
          $state.go('app.settings.profile');
          toastr.info(NstSvcTranslation.get("You can modify your profile settings here"));
        }, 1));
        return;
      }
      // Loads the place an its accesses
      loadPlace(vm.placeId).then(function(result) {
        if (result.accesses.hasReadAccess) {
          vm.place = result.place;
          vm.accesses = result.accesses;
          vm.placeType = getPlaceType(vm.place);
        } else {
          // The place was found but the user does not have READ access
          timeoutReferences.push($timeout(function () {
            $uibModalInstance.close();
            $state.go(NST_DEFAULT.STATE);
            toastr.error(NstUtility.string.format(NstSvcTranslation.get("Either <b>{0}</b> doesn't exist, or you don't have the permit to enter the Place."), result.place.id));
          }, 1));
        }

      }).catch(function(error) {
        switch (error.code) {
          // The place does not exist and the user must be navigated through
          // the app default state
          case NST_SRV_ERROR.UNAVAILABLE:
            timeoutReferences.push($timeout(function () {
              $uibModalInstance.close();
              $state.go(NST_DEFAULT.STATE);
              toastr.error(NstUtility.string.format(NstSvcTranslation.get("Either <b>{0}</b> doesn't exist, or you don't have the permit to enter the Place."), vm.placeId));
            }, 1));
            break;
          default:
            toastr.error(NstSvcTranslation.get("An error has occured while loading the place settings."));
            break;
        }
      });

      eventReferences.push($rootScope.$on('member-removed', function (event, data) {
        if (vm.place.id === data.place.id) {
          if (removedMembersTracker.isTracked(data.member.id)) {
            return;
          }
          vm.place = data.place;
          removedMembersTracker.track(data.member.id);
        }
      }));

      eventReferences.push($rootScope.$on('member-added', function (event, data) {
        if (vm.placeId === data.place.id) {
          if (addedMembersTracker.isTracked(data.member.id)) {
            return;
          }

          vm.place = data.place;
          addedMembersTracker.track(data.member.id);
        }
      }));

    })();


    /**
     * Finds the type of the place
     *
     * @param {any} place
     * @returns
     */
    function getPlaceType(place) {
      if (NstUtility.place.isGrand(place.id)) {

        return NST_PLACE_TYPE.GRAND;
      } else if (NstUtility.place.getGrandId(place.id) === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.SUB_PERSONAL;
      } else if (place.id === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.PERSONAL;
      } else if (place.privacy.locked) {

        return NST_PLACE_TYPE.PRIVATE;
      } else if (!place.privacy.locked) {

        return NST_PLACE_TYPE.COMMON;
      } else {

        throw Error("Could not figure out place type");
      }
    }

    /**
     * Loads the place and checks all required accesses
     *
     * @param {any} id
     * @returns
     */
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

    /**
     * Opens a crop modal (if the browser is not Safari) and sets the cropped picture as the place picture
     *
     * @param {any} event
     */
    function setPicture(event) {
      var file = event.currentTarget.files[0];
      if ($rootScope.deviceDetector.browser === 'safari' ) {
        var request = NstSvcStore.uploadWithProgress(file, logoUploadProgress, NST_STORE_UPLOAD_TYPE.PLACE_PIC, NstSvcAuth.lastSessionKey);

          request.getPromise().then(function (result) {
            NstSvcPlaceFactory.updatePicture(vm.place.id, result.data.universal_id).then(function (result) {
              NstSvcLogger.info(NstUtility.string.format('Place {0} picture updated successfully.', vm.place.id));
              toastr.success(NstSvcTranslation.get("The Place photo has been set successfully."));
            }).catch(function () {
              toastr.error(NstSvcTranslation.get("An error has occurred in updating the Place photo."));
            });

            vm.place.picture = new NstPicture(result.data.thumbs);
          });
      } else {
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
            var request = NstSvcStore.uploadWithProgress(vm.logoFile, logoUploadProgress, NST_STORE_UPLOAD_TYPE.PLACE_PIC, NstSvcAuth.lastSessionKey);

            request.getPromise().then(function (result) {
              NstSvcPlaceFactory.updatePicture(vm.place.id, result.data.universal_id).then(function (result) {
                NstSvcLogger.info(NstUtility.string.format('Place {0} picture updated successfully.', vm.place.id));
                toastr.success(NstSvcTranslation.get("The Place photo has been set successfully."));
              }).catch(function () {
                toastr.error(NstSvcTranslation.get("An error has occurred in updating the Place photo."));
              });

              vm.place.picture = new NstPicture(result.data.thumbs);
            });
          };

          reader.readAsDataURL(vm.logoFile);
        }).catch(function () {
          event.target.value = '';
        });
      }

    }

    /**
     * Logs upload progress
     *
     * @param {any} event
     */
    function logoUploadProgress(event) {
      vm.logoUploadedSize = event.loaded;
      vm.logoUploadedRatio = Number(event.loaded / event.total).toFixed(4);

      NstSvcLogger.error(NstUtility.string.format('Upload progress : {0}%', vm.logoUploadedRatio));
    }

    /**
     * Opens a confirmation modal and asks the user before leaving the place
     * @borrows leave
     */
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

    /**
     * Leaves the place and navigates to the leaved place's grand parent or feeds page
     *
     */
    function leave() {
      NstSvcPlaceFactory.leave(vm.placeId).then(function(result) {
        timeoutReferences.push($timeout(function () {
          $uibModalInstance.close();
          if (_.indexOf(vm.place.id, '.') > -1) {
            $state.go('app.place-messages', { placeId : vm.place.grandParentId });
          } else {
            $state.go(NST_DEFAULT.STATE);
          }
        }, 1));

      }).catch(function(error) {
        if (error.code === NST_SRV_ERROR.ACCESS_DENIED) {
          switch (error.message[0]) {
            case 'last_creator':
              toastr.error(NstSvcTranslation.get('You are the only one left!'));
            break;
            case 'parent_creator':
              toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to leave the Place because you are the creator of its highest-ranking Place ({0}).'), vm.place.parent.name));
            break;
            case 'cannot_leave_some_subplaces':
              toastr.error(NstSvcTranslation.get('You can not leave here, because you are the manager of one of its sub-places.'));
            break;
            default:
              toastr.error(NstSvcTranslation.get("An error has happened before leaving this place"));
          }
          return;
        }

        toastr.error(NstSvcTranslation.get("An error has happened before leaving this place"));
      });

    }

    /**
     * Opens a confirmation modal before removing the place
     * @borrows remove
     */
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

    /**
     * Removes the place and navigates to the removed place's grand parent or feeds page
     *
     */
    function remove() {
      NstSvcPlaceFactory.remove(vm.place.id).then(function(removeResult) {
        toastr.success(NstUtility.string.format(NstSvcTranslation.get("Place {0} was removed successfully."), vm.place.name));
        timeoutReferences.push($timeout(function () {
          $uibModalInstance.close();
          if (_.indexOf(vm.place.id, '.') > -1) {
            $state.go('app.place-messages', { placeId : vm.place.grandParentId });
          } else {
            $state.go(NST_DEFAULT.STATE);
          }
        }, 1));

      }).catch(function(error) {
        if (error.code === NST_SRV_ERROR.ACCESS_DENIED) {
          switch (error.message[0]) {
            case 'remove_children_first':
              toastr.error(NstSvcTranslation.get("You have to delete all the sub-Places within, before removing this Place."));
            break;
            default:
              toastr.error(NstSvcTranslation.get("An error has occurred in removing this Place."));
          }
          return;
        }

        toastr.error(NstSvcTranslation.get("An error has occurred in removing this Place."));
      });
    }

    /**
     * Removes the place picture
     *
     */
    function removePicture() {
      NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("Please make sure before removing the place picture.")).then(function(confirmed) {
        NstSvcPlaceFactory.updatePicture(vm.place.id, "").then(function (result) {
          vm.place.picture = null;
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get("An error occured while removing the place picture"));
        });
      });
    }

    // Listens to place-bookmark event and updates the place model
    eventReferences.push($rootScope.$on('place-bookmark', function (e, data) {
      if (data.placeId === vm.placeId) vm.options.bookmark = data.bookmark;
    }));

    // Listens to place-notification event and updates the place model
    eventReferences.push($rootScope.$on(NST_PLACE_EVENT.NOTIFICATION, function (e, data) {
      if (data.placeId === vm.placeId) vm.options.notification = data.notification;
    }));

    $scope.$on('$destroy', function () {
      _.forEach(timeoutReferences, $timeout.cancel);

      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

  }
})();
