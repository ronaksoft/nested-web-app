(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($scope, $stateParams, $q, $uibModal, $state, toastr, $rootScope, $timeout,
                                   NST_PLACE_POLICY_OPTION, NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_PLACE_FACTORY_EVENT, NST_PLACE_TYPE,
                                   NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstSvcInvitationFactory, NstSvcLogger,
                                   NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError, NstSvcTranslation,
                                   NstVmMemberItem) {
    var vm = this;
    $scope.NST_PLACE_POLICY_OPTION = NST_PLACE_POLICY_OPTION;
    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.reciveLevel = vm.memberLevel = vm.createLevel = vm.threeExampleLevel = 'l1';

    vm.options = {
      notification: null,
      bookmark: null
    };

    vm.accesses = {
      hasRemoveAccess: null,
      hasAddPlaceAccess: null,
      hasControlAccess: null,
      hasAddMembersAccess: null,
      hasSeeMembersAccess: null
    };

    vm.placeLoadProgress = false;

    vm.loadImage = loadImage;
    vm.setReceivingEveryone = setReceivingEveryone;
    vm.setReceivingMembers = setReceivingMembers;
    vm.setReceivingOff = setReceivingOff;
    vm.updateAddPlacePolicy = updateAddPlacePolicy;
    vm.updateAddMemberPolicy = updateAddMemberPolicy;
    vm.updateAddPostPolicy = updateAddPostPolicy;
    vm.updateSearchPrivacy = updateSearchPrivacy;


    (function () {
      NstSvcLogger.info('Initializing of PlaceSettingsController just started...');

      vm.place = null;
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;





      if (vm.user.id === vm.placeId.split('.')[0]) {
        vm.isSubPersonalPlace = true;
      }

      loadPlace(vm.placeId).then(function (result) {
        vm.place = result.place;
        vm.accesses = result.accesses;
        vm.placeType = getPlaceType(vm.place);

      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
      });


      $rootScope.$on('member-removed', function (event, data) {
        switch (data.member.role) {
          case NST_PLACE_MEMBER_TYPE.CREATOR:
            vm.place.counters.creators--;
            break;
          case NST_PLACE_MEMBER_TYPE.KEY_HOLDER:
            vm.place.counters.key_holders--;
            break;
          case 'pending_' + NST_PLACE_MEMBER_TYPE.KEY_HOLDER:
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

        NstSvcLogger.info(NstUtility.string.format('Place {0} was found.', result.place.id));

        result.accesses.hasRemoveAccess = place.hasAccess(NST_PLACE_ACCESS.REMOVE_PLACE);
        result.accesses.hasAddPlaceAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_PLACE);
        result.accesses.hasControlAccess = place.hasAccess(NST_PLACE_ACCESS.CONTROL);
        result.accesses.hasAddMembersAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
        result.accesses.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);

        initializeStates(place);
        setGrandPlace(place);

        NstSvcLogger.info(NstUtility.string.format('The settings of Place "{0}" have been retrieved successfully.', result.place.id));
        vm.placeLoadProgress = false;

        deferred.resolve(result);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function update(model) {
      if (model) {
        NstSvcPlaceFactory.update(vm.place.id, model).then(function (result) {
          NstSvcLogger.info(NstUtility.string.format('Place {0} information updated successfully.', vm.place.id));
        }).catch(function (error) {
          NstSvcLogger.error(error);
        });
      }
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

            NstSvcPlaceFactory.updatePicture(vm.place.id, result.data.universal_id).then(function (result) {
              NstSvcLogger.info(NstUtility.string.format('Place {0} picture updated successfully.', vm.place.id));
              toastr.success(NstSvcTranslation.get("The Place photo has been set successfully."));
            }).catch(function (error) {
              NstSvcLogger.error(error);
              toastr.error(NstSvcTranslation.get("An error has occurred in updating the Place photo."));
            });


            vm.place.getPicture().setX32(result.data.thumbs.x32);
            vm.place.getPicture().setX64(result.data.thumbs.x64);
            vm.place.getPicture().setX128(result.data.thumbs.x128);
            vm.place.getPicture().setPreview(result.data.thumbs.pre);
            vm.place.getPicture().setOriginal(result.data.thumbs.org);

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

    function setReceivingOff() {
      if ('off' !== vm.place.privacy.receptive) {
        vm.place.privacy.receptive = 'off';
        vm.place.privacy.search = false;

        update({
          'privacy.receptive': vm.place.privacy.receptive,
          'privacy.search': vm.place.privacy.search
        });
      }
    }

    function setReceivingMembers() {
      if ('internal' !== vm.place.privacy.receptive) {
        vm.place.privacy.receptive = 'internal';
        vm.place.privacy.add_post = 'everyone';

        update({
          'privacy.receptive': vm.place.privacy.receptive,
          'policy.add_post': vm.place.privacy.add_post
        });
      }
    }

    function setReceivingEveryone() {
      if ('external' !== vm.place.privacy.receptive) {
        vm.place.privacy.receptive = 'external';
        // vm.place.privacy.search = false;

        update({
          'privacy.receptive': vm.place.privacy.receptive,
          'policy.add_post': vm.place.privacy.add_post
        });
      }
    }

    function updateAddPlacePolicy() {
      update({'policy.add_place': vm.place.policy.add_place});
    }

    function updateAddMemberPolicy() {
      update({'policy.add_member': vm.place.policy.add_member});
    }

    function updateAddPostPolicy() {
      update({'policy.add_post': vm.place.policy.add_post});
    }

    function updateSearchPrivacy() {
      update({'privacy.search': vm.place.privacy.search});
    }

    function initializeStates(place) {
      vm.isClosedPlace = place.privacy.locked;
      vm.isOpenPlace = !place.privacy.locked;
      vm.isGrandPlace = place.grandParentId === place.id;
    }

    function updateName(value) {
      vm.place.name = value;
      update({'place_name': vm.place.name});
    }

    function updateDescription(value) {
      vm.place.description = value;
      update({'place_desc': vm.place.description});
    }

    function setGrandPlace(place) {
      NstSvcPlaceFactory.get(place.grandParentId).then(function (grand) {
        vm.grandPlace = grand;
      })
    }

    function getPlaceMembersCount(place) {
      return place.counters.key_holders + place.counters.creators;
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
