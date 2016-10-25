(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($scope, $stateParams, $q, $uibModal, $log, $state, toastr,
    NST_SRV_ERROR, NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_PLACE_FACTORY_EVENT, NST_DEFAULT,
    NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstSvcInvitationFactory, NstSvcLogger,
    NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError,
    NstVmMemberItem) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.options = {
      notification: null,
      bookmark : null
    };
    vm.accesses = {
      hasRemoveAccess : null,
      hasAddPlaceAccess : null,
      hasControlAccess : null,
      hasAddMembersAccess : null,
      hasSeeMembersAccess : null
    };

    vm.placeLoadProgress = false;
    vm.teammatesLoadProgress = false;


    vm.setNotification = setNotification;
    vm.setBookmark = setBookmark;
    vm.addMember = addMember;
    vm.loadImage = loadImage;
    vm.setReceivingEveryone = setReceivingEveryone;
    vm.setReceivingMembers = setReceivingMembers;
    vm.setReceivingOff = setReceivingOff;


    (function() {
      $log.debug('Initializing of PlaceSettingsController just started...');

      vm.place = null;
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;

      loadPlace(vm.placeId).then(function (result) {
        vm.place = result.place;
        vm.accesses = result.accesses;

        return loadTeammates(vm.placeId, vm.accesses.hasSeeMembersAccess, vm.accesses.hasControlAccess);
      }).then(function (result) {

        vm.teammates = result.teammates;
      }).catch(function(error) {
        NstSvcLogger.error(error);
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
      $scope.$on('member-removed', function (event, data) {
        switch (data.member.role) {
          case NST_PLACE_MEMBER_TYPE.CREATOR:
          case NST_PLACE_MEMBER_TYPE.KEY_HOLDER:
          case 'pending_' + NST_PLACE_MEMBER_TYPE.KEY_HOLDER:
            var memberIndex = _.findIndex(vm.teammates, { id : data.member.id });
            if (memberIndex > -1) {
              vm.teammates.splice(memberIndex, 1);
            }
            break;
          default:
            $log.debug(NstUtility.string.format('Can not remove the member, Because her role is "{0}" which was not expected!', data.previousRole));
            break;

        }
      });

    })();

    function loadPlace(id) {
      var deferred = $q.defer(),
          result = {
            place : null,
            accesses : {}
          };

      vm.placeLoadProgress = true;
      NstSvcPlaceFactory.get(id).then(function(place) {
        result.place = place;
        console.log(place);
        $log.debug(NstUtility.string.format('Place {0} was found.', result.place.id));
        initializeStates(place);

        return $q.all([
          NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.REMOVE_PLACE),
          NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_PLACE),
          NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.CONTROL),
          NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_MEMBERS),
          NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.SEE_MEMBERS),
          // NstSvcPlaceFactory.getNotificationOption(vm.placeId),
          // NstSvcPlaceFactory.getBookmarkOption(vm.placeId, '_starred')
        ]);
      }).then(function(resolvedSet) {

        result.accesses.hasRemoveAccess = resolvedSet[0];
        result.accesses.hasAddPlaceAccess = resolvedSet[1];
        result.accesses.hasControlAccess = resolvedSet[2];
        result.accesses.hasAddMembersAccess = resolvedSet[3];
        result.accesses.hasSeeMembersAccess = resolvedSet[4];
        // result.place.notification = resolvedSet[5];
        // result.place.bookmark = resolvedSet[6];

        $log.debug(NstUtility.string.format('Place "{0}" settings have been retrieved successfully.', result.place.id));
        vm.placeLoadProgress = false;

        deferred.resolve(result);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function loadTeammates(id, accessToSeeMembers, accessToSeePendings) {
      var deferred = $q.defer(),
          result = {
            teammates : []
          };

      if (!accessToSeeMembers) {
        deferred.resolve(result);
      } else {
        vm.teammatesLoadProgress = true;
        NstSvcPlaceFactory.getMembers(id).then(function (members) {

          result.teammates = _.concat(_.map(members.creators, function (member) {
            return new NstVmMemberItem(member, 'creator');
          }), _.map(members.keyHolders, function (member) {
            return new NstVmMemberItem(member, 'key_holder');
          }));

          NstSvcLogger.info(NstUtility.string.format('Place "{0}" has {1} creator(s), {2} key holder(s).',
            id,
            members.creators ? members.creators.length : 0,
            members.keyHolders ? members.keyHolders.length : 0
          ));

          return accessToSeePendings ? NstSvcInvitationFactory.getPlacePendingInvitations(vm.placeId) : $q.resolve(null);
        }).then(function (pendings) {
          if (pendings) {
            result.teammates = _.concat(result.teammates, _.map(pendings.pendingKeyHolders, function (invitation) {
              return new NstVmMemberItem(invitation, 'pending_key_holder');
            }));

            NstSvcLogger.info(NstUtility.string.format('Place "{0}" has {1} pending key holder(s).',
              id,
              pendings.pendingKeyHolders ? pendings.pendingKeyHolders.length : 0
            ));
          } else {
            NstSvcLogger.info(NstUtility.string.format('Place "{0}" has not any pending key holders.', id));
          }

          vm.teammatesLoadProgress = false;
          deferred.resolve(result);

        }).catch(deferred.reject);
      }

      return deferred.promise;
    }

    function showAddModal(role) {

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-add-member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'addMemberCtrl',
        size: 'sm',
        resolve: {
          chosenRole: function() {
            return role;
          },
          currentPlace: function() {
            return vm.place;
          }
        }
      });

      modal.result.then(function(selectedUsers) {
        $q.all(_.map(selectedUsers, function(user) {

          return $q(function(resolve, reject) {
            var command  = vm.isGrandPlace ? 'inviteUser' : 'addUser';
            NstSvcPlaceFactory[command](vm.place, role, user).then(function(invitationId) {

              $log.debug(NstUtility.string.format('User "{0}" was invited to Place "{1}" successfully.', user.id, vm.place.id));
              resolve({
                user: user,
                role: role,
                invitationId: vm.isGrandPlace ? invitationId : -1,
              });
            }).catch(function(error) {
              // FIXME: Why cannot catch the error!
              if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
                $log.debug(NstUtility.string.format('User "{0}" was previously invited to Place "{1}".', user.id, vm.place.id));
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

        })).then(function(values) {
          _.forEach(values, function(result) {
            if (!result.duplicate) {
              if (result.role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
                var rolePrefix = vm.isGrandPlace ? 'pending_' : '';
                vm.teammates.push(new NstVmMemberItem(result.user, rolePrefix + result.role));
              }
            }
          });
        }).catch(function(error) {
          $log.debug(error);
        });
      });
    }

    function addMember() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
    }


    function updatePrivacy(name, value) {
      if (name && value) {
        vm.place.privacy[name] = value;
      }
      update('privacy', vm.place.privacy);
    }

    function updatePolicy(name, value) {
      if (name && value &&
        vm.place.policy[name] !== value) {
        vm.place.policy[name] = value
      }
      update('policy', vm.place.policy);
    }

    function update(property, value) {
      if (property && value) {
        vm.place[property] = value;
      }

      NstSvcPlaceFactory.save(vm.place).then(function(result) {
        $log.debug(NstUtility.string.format('Place {0} information updated successfully.', vm.place.id));
      }).catch(function(error) {
        $log.debug(error);
      });
    }

    function setNotification() {
      NstSvcPlaceFactory.setNotificationOption(vm.placeId, vm.options.notification).then(function(result) {
        $log.debug(NstUtility.string.format('Place {0} notification setting changed to {1} successfully.', vm.place.id, vm.options.notification));
      }).catch(function(error) {
        $log.debug(error);
      });
    }

    function setBookmark() {
      NstSvcPlaceFactory.setBookmarkOption(vm.placeId, '_starred', vm.options.bookmark).then(function(result) {
        $log.debug(NstUtility.string.format('Place {0} bookmark setting changed to {1} successfully.', vm.place.id, vm.options.bookmark));
      }).catch(function(error) {
        $log.debug(error);
      });
    }

    function loadImage(event) {
      var file = event.currentTarget.files[0];

      if (file) {
        vm.logoFile = file;
        vm.logoUrl = '';

        var reader = new FileReader();
        reader.onload = function(readEvent) {
          $log.debug('The picture is loaded locally and going to be sent to server.');
          vm.logoUrl = readEvent.target.result;

          // upload the picture
          var request = NstSvcStore.uploadWithProgress(vm.logoFile, logoUploadProgress, NST_STORE_UPLOAD_TYPE.PLACE_PICTURE);

          request.getPromise().then(function(result) {
            vm.place.getPicture().setId(result.data.universal_id);
            vm.place.getPicture().setThumbnail(32, vm.place.getPicture().getOrg());
            vm.place.getPicture().setThumbnail(64, vm.place.getPicture().getOrg());
            vm.place.getPicture().setThumbnail(128, vm.place.getPicture().getOrg());
            NstSvcPlaceFactory.updatePicture(vm.place.id, result.data.universal_id).then(function(result) {
              $log.debug(NstUtility.string.format('Place {0} picture updated successfully.', vm.place.id));
            }).catch(function(error) {
              $log.debug(error);
            })
          });
        };

        reader.readAsDataURL(vm.logoFile);
      }
    }

    function logoUploadProgress(event) {
      vm.logoUploadedSize = event.loaded;
      vm.logoUploadedRatio = Number(event.loaded / event.total).toFixed(4);

      $log.debug(NstUtility.string.format('Upload progress : {0}%', vm.logoUploadedRatio));
    }

    function hasAnyTeammate() {
      return vm.teammates && vm.teammates.length > 0;
    }

    function setReceivingOff() {
      vm.receivingMode = 'off';

      vm.place.privacy.receptive = 'off';
      vm.place.privacy.search = false;
      update('privacy', vm.place.privacy);
    }

    function setReceivingMembers() {
      vm.receivingMode = 'members';

      vm.place.privacy.receptive = 'internal';
      vm.place.privacy.addPost = 'everyone';
      update('privacy', vm.place.privacy);
    }

    function setReceivingEveryone() {
      vm.receivingMode = 'everyone';

      vm.place.privacy.receptive = 'external';
      vm.place.privacy.addPost = 'everyone';
      update('privacy', vm.place.privacy);
    }

    function initializeStates(place) {
      vm.isClosedPlace = place.privacy.locked;
      vm.isOpenPlace = !place.privacy.locked;
      vm.isGrandPlace = (!place.parent) && (place.grandParent.id === place.id);
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
