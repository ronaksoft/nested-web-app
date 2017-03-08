(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($scope, $stateParams, $q, $uibModal, $state, toastr, $rootScope, $timeout,
                                   NST_SRV_ERROR, NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_PLACE_FACTORY_EVENT, NST_DEFAULT,
                                   NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstSvcInvitationFactory, NstSvcLogger,
                                   NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError, NstSvcTranslation,
                                   NstVmMemberItem) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/
    vm.onMemberSelect = onSelect;
    var onSelectTimeout = null;
    vm.reciveLevel = vm.memberLevel = vm.createLevel = vm.threeExampleLevel = 'l1';
    vm.memberOptions = {
      'creators': NstSvcTranslation.get("Manager(s) only"),
      'everyone': NstSvcTranslation.get("All Members")
    };
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
    vm.teammates = [];
    var defaultTeammatesLimit = 16;
    vm.teammatesSettings = {
      skip: 0,
      limit: defaultTeammatesLimit,
      creatorsCount: 0,
      keyHoldersCount: 0,
      pendingsCount: 0
    };

    vm.placeLoadProgress = false;
    vm.teammatesLoadProgress = false;

    vm.addMember = addMember;
    vm.loadImage = loadImage;
    vm.setReceivingEveryone = setReceivingEveryone;
    vm.setReceivingMembers = setReceivingMembers;
    vm.setReceivingOff = setReceivingOff;
    vm.updateAddPlacePolicy = updateAddPlacePolicy;
    vm.updateAddMemberPolicy = updateAddMemberPolicy;
    vm.updateAddPostPolicy = updateAddPostPolicy;
    vm.updateSearchPrivacy = updateSearchPrivacy;
    vm.loadMoreTeammates = loadMoreTeammates;
    vm.updateName = updateName;
    vm.updateDescription = updateDescription;


    (function () {
      NstSvcLogger.info('Initializing of PlaceSettingsController just started...');

      vm.place = null;
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;

      if (vm.user.id === vm.placeId) {
        vm.isPersonalPlace = true;
      }


      if (vm.user.id === vm.placeId.split('.')[0]) {
        vm.isSubPersonalPlace = true;
      }

      loadPlace(vm.placeId).then(function (result) {
        vm.place = result.place;
        vm.accesses = result.accesses;

        vm.teammatesLoadProgress = true;
        return loadTeammates(vm.placeId,
          vm.accesses.hasSeeMembersAccess && vm.placeId !== NstSvcAuth.user.id,
          vm.accesses.hasControlAccess && vm.placeId !== NstSvcAuth.user.id);
      }).then(function (teammates) {
        vm.hasMoreTeammates = teammates.length === defaultTeammatesLimit;
        vm.teammates = teammates;


      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.teammatesLoadProgress = false;
      });

      $scope.$on('member-promoted', function (event, data) {
        if (data.member.role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
          data.member.role = NST_PLACE_MEMBER_TYPE.CREATOR;
        }
      });
      $scope.$on('member-demoted', function (event, data) {
        if (data.member.role === NST_PLACE_MEMBER_TYPE.CREATOR) {
          data.member.role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
        }
      });
      $rootScope.$on('member-removed', function (event, data) {
        switch (data.member.role) {
          case NST_PLACE_MEMBER_TYPE.CREATOR:
          case NST_PLACE_MEMBER_TYPE.KEY_HOLDER:
          case 'pending_' + NST_PLACE_MEMBER_TYPE.KEY_HOLDER:
            var memberIndex = _.findIndex(vm.teammates, {id: data.member.id});
            if (memberIndex > -1) {
              vm.teammates.splice(memberIndex, 1);
            }
            break;
          default:
            NstSvcLogger.error(NstUtility.string.format('Can not remove the member, Because her role is "{0}" which was not expected!', data.previousRole));
            break;

        }
      });

    })();

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

    function getCreators(placeId, limit, skip, hasAccess) {
      var deferred = $q.defer();
      if (hasAccess && vm.teammatesSettings.creatorsCount < vm.place.counters.creators) {

        NstSvcPlaceFactory.getCreators(placeId, limit, skip).then(function (result) {

          var creatorItems = _.map(result.creators, function (item) {
            return new NstVmMemberItem(item, 'creator');
          });

          deferred.resolve({
            creators : creatorItems,
            total : result.total
          });
        }).catch(deferred.reject);

      } else {
        deferred.resolve({
          creators : []
        });
      }

      return deferred.promise;
    }

    function getKeyholders(placeId, limit, skip, hasAccess) {
      var deferred = $q.defer();

      if (limit > 0 && hasAccess && vm.teammatesSettings.keyHoldersCount < vm.place.counters.key_holders) {
        NstSvcPlaceFactory.getKeyholders(placeId, limit, skip).then(function (result) {
          var keyHolderItems = _.map(result.keyHolders, function (item) {
            return new NstVmMemberItem(item, 'key_holder');
          });

          deferred.resolve({
            keyHolders : keyHolderItems,
            total : result.total
          });
        }).catch(deferred.reject);
      } else {
        deferred.resolve({
          keyHolders : []
        });
      }

      return deferred.promise;
    }

    function getPendings(placeId, limit, skip, access) {
      var deferred = $q.defer();
      if (limit > 0 && access) {
        NstSvcInvitationFactory.getPlacePendingInvitations(placeId, limit, skip).then(function (invitations) {
          var pendings = _.map(invitations, function (item) {
            return new NstVmMemberItem(item, 'pending_key_holder');
          });

          deferred.resolve(pendings);
        }).catch(deferred.reject);
      } else {
        deferred.resolve([]);
      }

      return deferred.promise;
    }

    function loadTeammates(placeId, accessToSeeMembers, accessToSeePendings) {
      var deferred = $q.defer();

      var teammates = [];
      var pageCounts = {
        creators: 0,
        keyHolders: 0,
        pendings: 0
      };
      vm.teammatesSettings.limit = defaultTeammatesLimit;
      vm.teammatesSettings.skip = vm.teammatesSettings.creatorsCount;

      getCreators(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, accessToSeeMembers).then(function (result) {
        pageCounts.creators = result.creators.length;
        vm.teammatesSettings.limit = defaultTeammatesLimit - pageCounts.creators;
        vm.teammatesSettings.creatorsCount += result.creators.length;
        vm.teammatesSettings.skip = vm.teammatesSettings.keyHoldersCount;
        teammates.push.apply(teammates, result.creators);

        return getKeyholders(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, accessToSeeMembers);
      }).then(function (result) {

        pageCounts.keyHolders = result.keyHolders.length;
        vm.teammatesSettings.limit = defaultTeammatesLimit - pageCounts.keyHolders - pageCounts.creators;
        vm.teammatesSettings.keyHoldersCount += result.keyHolders.length;
        vm.teammatesSettings.skip = vm.teammatesSettings.pendingsCount;

        teammates.push.apply(teammates, result.keyHolders);
        return getPendings(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, accessToSeePendings);
      }).then(function (pendings) {
        vm.teammatesSettings.pendingsCount += pendings.length;
        pageCounts.pendings = pendings.length;

        teammates.push.apply(teammates, pendings);

        deferred.resolve(teammates);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function loadMoreTeammates() {
      vm.teammatesLoadProgress = true;
      return loadTeammates(vm.placeId, vm.accesses.hasSeeMembersAccess, vm.accesses.hasControlAccess).then(function (teammates) {
        vm.teammates.push.apply(vm.teammates, teammates);
        vm.hasMoreTeammates = teammates.length === defaultTeammatesLimit;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.teammatesLoadProgress = false;
      });
    }

    function onSelect(uIds, el) {
      if (onSelectTimeout) {
        $timeout.cancel(onSelectTimeout);
      }

      onSelectTimeout = $timeout(function () {
        vm.selectedMates = _.filter(vm.teammates, function (member) {
          return _.includes(uIds, member.id);
        });
        //TODO you need this number and array for some actions ...
      },10);
    }

    function showAddModal(role) {

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-add-member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'addMemberCtrl',
        size: 'sm',
        resolve: {
          chosenRole: function () {
            return role;
          },
          currentPlace: function () {
            return vm.place;
          }
        }
      });

      modal.result.then(function (selectedUsers) {

        var successRes = [];
        var failedRes = [];

        $q.all(_.map(selectedUsers, function (user) {


          return $q(function (resolve, reject) {
            var command = vm.isGrandPlace ? 'inviteUser' : 'addUser';
            NstSvcPlaceFactory[command](vm.place, role, user).then(function (invitationId) {
              successRes.push(user.id);
              NstSvcLogger.info(NstUtility.string.format('User "{0}" has been invited to Place "{1}" successfully.', user.id, vm.place.id));

              resolve({
                user: user,
                role: role,
                invitationId: vm.isGrandPlace ? invitationId : -1,
              });
            }).catch(function (error) {
              failedRes.push(user.id);

              // FIXME: Why cannot catch the error!
              if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
                NstSvcLogger.warn(NstUtility.string.format('User "{0}" has been previously invited to Place "{1}".', user.id, vm.place.id));
                resolve({
                  user: user,
                  role: role,
                  invitationId: null,
                  duplicate: true
                });
              } else {
                reject(error);
              }
            });
          });

        })).then(function (values) {
          _.forEach(values, function (result) {
            if (!result.duplicate) {
              if (result.role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
                var rolePrefix = vm.isGrandPlace ? 'pending_' : '';
                vm.teammates.push(new NstVmMemberItem(result.user, rolePrefix + result.role));
              }
            }

            if (successRes.length > 0) {
              toastr.success(NstUtility.string.format(NstSvcTranslation.get('{0} user has been {1} to Place "{2}" successfully.'), successRes.length, vm.isGrandPlace ? 'invited' : 'added', vm.place.id));
            }
            if (failedRes > 0) {
              if (vm.isGrandPlace) {
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('{0} User(s) has not been invited to Place {1}.'), failedRes.length, vm.place.id));
              } else {
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('{0} User(s) has not been added to Place {1}.'), failedRes.length, user.id, vm.place.id) + " " + failedRes.join(','));
              }
            }


          });
        }).catch(function (error) {
          NstSvcLogger.error(error);
        });
      });
    }

    function addMember() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
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
      }).catch(function() {
        event.target.value = '';
      });

    }

    function logoUploadProgress(event) {
      vm.logoUploadedSize = event.loaded;
      vm.logoUploadedRatio = Number(event.loaded / event.total).toFixed(4);

      NstSvcLogger.error(NstUtility.string.format('Upload progress : {0}%', vm.logoUploadedRatio));
    }

    function hasAnyTeammate() {
      return vm.teammates && vm.teammates.length > 0;
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
