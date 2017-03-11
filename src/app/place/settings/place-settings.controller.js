(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($scope, $stateParams, $q, $uibModal, $state, toastr, $rootScope, $timeout, $uibModalInstance,
                                   NST_PLACE_POLICY_OPTION, NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_PLACE_FACTORY_EVENT, NST_PLACE_TYPE,
                                   NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstSvcInvitationFactory, NstSvcLogger,
                                   NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError, NstSvcTranslation,
                                   NstVmMemberItem) {
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
      hasSeeMembersAccess: null
    };
    vm.tempPictureUrl = null;


    vm.placeLoadProgress = false;
    vm.loadImage = loadImage;
    vm.removeImage = removeImage;

    (function() {
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;

      loadPlace(vm.placeId).then(function(result) {
        vm.place = result.place;
        vm.accesses = result.accesses;
        vm.placeType = getPlaceType(vm.place);

      }).catch(function(error) {
        NstSvcLogger.error(error);
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
      } else if (place.privacy.locked) {

        return NST_PLACE_TYPE.PRIVATE;
      } else if (!place.privacy.locked) {

        return NST_PLACE_TYPE.COMMON;
      } else if (place.id === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.PERSONAL;
      } else if (NstUtility.place.getGrandId(place.id) === NstSvcAuth.user.id) {

        return NST_PLACE_TYPE.SUB_PERSONAL;
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

        vm.placeLoadProgress = false;

        deferred.resolve(result);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function loadImage(event) {
      var file = event.currentTarget.files[0];


      $uibModal.open({
        animation: false,
        size: 'no-miss crop',
        templateUrl: 'app/account/crop/change-pic.modal.html',
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
            console.log('upload result', result);

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

    function removeImage() {

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
