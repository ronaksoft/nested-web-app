(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($scope, $rootScope, $stateParams, $q, $uibModal, $log, $state, toastr, $timeout,
    NST_SRV_ERROR, NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_NAVBAR_CONTROL_TYPE, NST_DEFAULT,
    NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstVmNavbarControl, NstSvcInvitationFactory,
    NstPlaceOneCreatorLeftError, NstPlaceCreatorOfParentError,
    NstPlace, NstPicture, NstVmMemberItem) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.options = {
      notification: null
    };
    vm.hasRemoveAccess = null;
    vm.hasAddPlaceAccess = null;
    vm.hasControlAccess = null;
    vm.hasAddMembersAccess = null;
    vm.hasSeeMembersAccess = null;

    vm.updatePrivacy = updatePrivacy;
    vm.setNotification = setNotification;
    vm.update = update;
    vm.addMember = addMember;
    vm.inviteParticipant = inviteParticipant;
    vm.loadImage = loadImage;
    vm.confirmToLock = confirmToLock;
    vm.confirmToLeave = confirmToLeave;
    vm.confirmToRemove = confirmToRemove;
    vm.hasAnyTeamate = hasAnyTeamate;
    vm.hasAnyParticipant = hasAnyParticipant;
    vm.allowedToAddSubPlace = allowedToAddSubPlace;
    vm.allowedToDelete = allowedToDelete;
    vm.allowedToLeave = allowedToLeave;
    vm.hasAnyControlOverHere = hasAnyControlOverHere;

    (function() {
      $log.debug('Initializing of PlaceSettingsController just started...');
      vm.place = {};
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;
      NstSvcPlaceFactory.get(vm.placeId).then(function(place) {
        vm.place = place;
        vm.isGrandPlace = !vm.place.parent || !vm.place.parent.id;

        $log.debug(NstUtility.string.format('Place {0} was found.', vm.place.name));

        return $q.all([
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.REMOVE_PLACE),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_PLACE),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.CONTROL),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_MEMBERS),
          NstSvcAuth.hasAccess(vm.placeId, NST_PLACE_ACCESS.SEE_MEMBERS),
          NstSvcPlaceFactory.getNotificationOption(vm.placeId)
        ]);
      }).then(function(values) {
        vm.hasRemoveAccess = values[0];
        vm.hasAddPlaceAccess = values[1];
        vm.hasControlAccess = values[2];
        vm.hasAddMembersAccess = values[3];
        vm.hasSeeMembersAccess = values[4];
        vm.options.notification = values[5];

        $log.debug(NstUtility.string.format('Place "{0}" settings retrieved successfully.', vm.place.name));

        return vm.hasSeeMembersAccess ?
          NstSvcPlaceFactory.getMembers(vm.placeId) :
          $q(function(resolve) {
            resolve({});
          });
      }).then(function(members) {
        vm.teamates = _.concat(_.map(members.creators, function (member) {
          return new NstVmMemberItem(member, 'creator');
        }), _.map(members.keyHolders, function (member) {
          return new NstVmMemberItem(member, 'key_holder');
        }));

        vm.participants = _.map(members.knownGuests, function (member) {
          return new NstVmMemberItem(member, 'known_guest');
        });

        $log.debug(NstUtility.string.format('Place "{0}" has {1} creator(s), {2} key holder(s) and {3} known guest(s).',
          vm.place.name,
          members.creators ? members.creators.length : 0,
          members.keyHolders ? members.keyHolders.length : 0,
          members.knownGuests ? members.knownGuests.length : 0
        ));

        // A known guest is not allowed to see other members that their invitation is still pending
        var allowedToSeePendings = !(vm.place.id === NstSvcAuth.user.id);

        return allowedToSeePendings ? NstSvcInvitationFactory.getPlacePendingInvitations(vm.placeId) :
          $q(function(resolve) {
            resolve({});
          });
      }).then(function(pendings) {
        vm.teamates = _.concat(vm.teamates, _.map(pendings.pendingKeyHolders, function (invitation) {
          return new NstVmMemberItem(invitation, 'pending_key_holder');
        }));

        vm.participants = _.concat(vm.participants, _.map(pendings.pendingKnownGuests, function (invitation) {
          return new NstVmMemberItem(invitation, 'pending_known_guest');
        }));

        $log.debug(NstUtility.string.format('Place "{0}" has {1} pending key holder(s) and {2} pending known guest(s).',
          vm.place.name,
          pendings.pendingKeyHolders ? pendings.pendingKeyHolders.length : 0,
          pendings.pendingKnownGuests ? pendings.pendingKnownGuests.length : 0
        ));

      }).catch(function(error) {
        $log.debug(error);
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
            var memberIndex = _.findIndex(vm.teamates, { id : data.member.id });
            if (memberIndex > -1) {
              vm.teamates.splice(memberIndex, 1);
            }
            break;
          case NST_PLACE_MEMBER_TYPE.KNOWN_GUEST:
          case 'pending_' + NST_PLACE_MEMBER_TYPE.KNOWN_GUEST:
            var memberIndex = _.findIndex(vm.participants, { id : data.member.id });
            if (memberIndex > -1) {
              vm.participants.splice(memberIndex, 1);
            }
            break;
          default:
            $log.debug(NstUtility.string.format('Can not remove the member, Because her role is "{0}" which was not expected!', data.previousRole));
            break;

        }
      });

    })();

    function allowedToAddSubPlace() {
      return vm.hasAddPlaceAccess;
    }


    function allowedToDelete() {
      return vm.hasRemoveAccess && vm.place.children.length === 0;
    }


    /**
     * allowedToLeave - Check if the user is allowed to leave the place
     * If the user is the only creator of the place, Leaving is not possible and the place should be removed
     *
     *
     * @return {type}  description
     */
    function allowedToLeave() {
      return vm.teamates && vm.teamates.length > 1;
    }

    function hasAnyControlOverHere() {
      return allowedToDelete() || allowedToLeave() || allowedToAddSubPlace();
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
            NstSvcPlaceFactory.addUser(vm.place, role, user).then(function(invitationId) {

              $log.debug(NstUtility.string.format('User "{0}" was invited to Place "{1}" successfully.', user.id, vm.place.id));
              resolve({
                user: user,
                role: role,
                invitationId: invitationId
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
                vm.teamates.push(new NstVmMemberItem(result.user, 'pending_' + result.role));
              } else if (result.role === NST_PLACE_MEMBER_TYPE.KNOWN_GUEST) {
                vm.participants.push(new NstVmMemberItem(result.user, 'pending_' + result.role));
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

    function inviteParticipant() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KNOWN_GUEST);
    }

    function confirmToLock(event) {
      event.preventDefault();
      event.stopPropagation();

      $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-lock-warning.html',
        size: 'sm'
      }).result.then(function(result) {
        updatePrivacy('locked', !vm.place.privacy.getLocked());
      });

      return false;
    }

    function confirmToRemove() {

      $scope.deleteValidated = false;
      $scope.nextStep = false;

      var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/pages/places/settings/place-delete.html',
          controller : 'PlaceRemoveConfirmController',
          controllerAs : 'removeCtrl',
          size: 'sm',
          resolve: {
            selectedPlace : function () {
              return vm.place;
            }
          }
        }).result.then(function(confirmResult) {
          remove();
        });
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
            return vm.place;
          }
        }
      }).result.then(function() {
        leave();
      });
    }

    function leave() {
      NstSvcPlaceFactory.removeMember(vm.place.id, NstSvcAuth.user.id).then(function(result) {
        $state.go(NST_DEFAULT.STATE);
      }).catch(function(error) {
        if (error instanceof NstPlaceOneCreatorLeftError){
          toastr.error('You are the only creator of the place!');
        } else if (error instanceof NstPlaceCreatorOfParentError) {
          toastr.error(NstUtility.string.format('You are not allowed to leave here, because you are creator of the top-level place ({0}).', vm.place.parent.name));
        }
        $log.debug(error);
      });

    }

    function remove() {
      NstSvcPlaceFactory.remove(vm.place.id).then(function(removeResult) {
        $state.go(NST_DEFAULT.STATE);
      }).catch(function(error) {
        $log.debug(error);
      });
    }

    function updatePrivacy(name, value) {
      if (name && value) {
        vm.place.privacy[name] = value;
      }
      update('privacy', vm.place.privacy);
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

    function hasAnyTeamate() {
      return vm.teamates && vm.teamates.length > 0;
    }

    function hasAnyParticipant() {
      return vm.participants && vm.participants.length > 0;
    }


    // FIXME some times it got a problem ( delta causes )
    vm.preventParentScroll = function (event) {
      var element = event.currentTarget;
      var delta = event.wheelDelta;
      if ((element.scrollTop === (element.scrollHeight - element.clientHeight) && delta < 0) || (element.scrollTop === 0 && delta > 0)) {
        event.preventDefault();
      }
    };

    vm.recentScrollConf = {
      axis: 'y',
      mouseWheel: {
        preventDefault: true
      }
    };


    // FIXME: NEEDS REWRITE COMPLETELY
    var tl = new TimelineLite({});
    var cp = document.getElementById("cp1");
    var nav = document.getElementsByTagName("nst-navbar")[0];
    $timeout(function () {
      $rootScope.navView = false
    });

  }
})();
