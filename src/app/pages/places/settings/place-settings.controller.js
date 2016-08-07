(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($location, $scope, $stateParams, $q, $uibModal, $log, $state,
    NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_NAVBAR_CONTROL_TYPE,
    NstSvcStore, NstSvcAuth, NstSvcPlaceFactory, NstUtility, NstVmNavbarControl,
    NstPlace, NstPicture) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.members = {};
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

    vm.controls = {
      left: [
        new NstVmNavbarControl('Back', NST_NAVBAR_CONTROL_TYPE.BUTTON_BACK)
      ],
      right: [
        new NstVmNavbarControl('Leave', NST_NAVBAR_CONTROL_TYPE.BUTTON_INPUT_LABEL, undefined, vm.confirmToLeave)
      ]
    };

    (function() {
      $log.debug('Initializing of PlaceSettingsController just started...');
      vm.place = {};
      vm.placeId = $stateParams.placeId;
      vm.user = NstSvcAuth.user;
      NstSvcPlaceFactory.get(vm.placeId).then(function(place) {
        vm.place = place;
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

        return vm.hasSeeMembersAccess ? NstSvcPlaceFactory.getMembers(vm.placeId) :
          $q(function(resolve) {
            resolve([]);
          });
      }).then(function(members) {

        vm.members.creators = members.creators;
        vm.members.keyHolders = members.keyHolders;
        vm.members.knownGuests = members.knownGuests;

        $log.debug(NstUtility.string.format('Place "{0}" has {1} creator(s), {2} key holder(s) and {3} known guest(s).',
          vm.place.name,
          vm.members.creators.length,
          vm.members.keyHolders.length,
          vm.members.knownGuests.length
        ));

        return vm.hasSeeMembersAccess ? NstSvcPlaceFactory.getPendings(vm.placeId) :
          $q(function(resolve) {
            resolve([]);
          });
      }).then(function(pendings) {

        vm.members.pendingKeyHolders = pendings.pendingKeyHolders;
        vm.members.pendingKnownGuests = pendings.pendingKnownGuests;

        $log.debug(NstUtility.string.format('Place "{0}" has {1} pending key holder(s) and {2} pending known guest(s).',
          vm.place.name,
          vm.members.pendingKeyHolders.length,
          vm.members.pendingKnownGuests.length
        ));

        vm.hasAnyGuest = _.some(vm.members.knownGuests) ||
          _.some(vm.members.pendingKnownGuests);

        vm.hasAnyTeamate = _.some(vm.members.creators) ||
          _.some(vm.members.keyHolders) ||
          _.some(vm.members.pendingKeyHolders);
      }).catch(function(error) {
        $log.debug(error);
      });

    })();



    function showAddModal(role) {
      console.log(role);

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
        },
      });

      modal.result.then(function(selectedUsers) {
        $q.all(_.map(selectedUsers, function(user) {

          return $q(function(resolve, reject) {
            NstSvcPlaceFactory.addUser(vm.place, role, user).then(function(invitationId) {
              console.log('invitation id is :', invitationId);
              $log.debug(NstUtility.string.format('User "{0}" was invited to Place "{1}" successfully.', user.id, vm.place.id));
              resolve({
                user: user,
                role: role,
                invitationId: invitationId
              });
            }).catch(function(error) {
              // FIXME: Why cannot catch the error!
              console.log(error);
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
                vm.members.pendingKeyHolders.push(result.user);
              } else if (result.role === NST_PLACE_MEMBER_TYPE.KNOWN_GUEST) {
                vm.members.pendingKnownGuests.push(result.user);
              }
            }
          });
        }).catch(function(error) {
          $log.debug('an error from all.', error);
        });
      });
    };

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
    };

    function confirmToRemove() {

      $scope.deleteValidated = false;
      $scope.nextStep = false;

      var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/pages/places/option/place-delete.html',
          size: 'sm',
          scope: {
            place: vm.place
          }
        }).result.then(function(confirmResult) {
          NstSvcPlaceFactory.remove(vm.place.id).then(function(removeResult) {
            $state.go('messages');
          }).catch(function(error) {
            $log.debug(error);
          });
        }).catch(function (reason) {

        });

    };

    function confirmToLeave() {

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/place-leave-confirm.html',
        size: 'sm',
        scope: {
          place: vm.place
        }
      }).result.then(function() {
        console.log('where do you wanna go?');
        leave();
      });
    };

    function removeMember(username) {
      return NstSvcPlaceFactory.removeMember(vm.place.id, username).then(function() {}).catch(function(error) {
        $log.debug(error);
      });
    }

    function leave() {
      return NstSvcPlaceFactory.removeMember(vm.place.id, NstSvcAuth.user.id).then(function() {}).catch(function(error) {
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
  }
})();
