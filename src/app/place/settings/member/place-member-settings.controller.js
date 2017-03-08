(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMemberSettingsController', PlaceMemberSettingsController);

  /** @ngInject */
  function PlaceMemberSettingsController($q, $uibModal, toastr, $scope, $rootScope,
                                         NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_SRV_ERROR,
                                         NstSvcPlaceFactory, NstSvcInvitationFactory, NstVmMemberItem,
                                         NstSvcAuth, NstSvcModal,
                                         NstUtility, NstSvcTranslation, NstSvcLogger) {

    var defaultTeammatesLimit = 16;

    var vm = this;
    vm.teammatesLoadProgress = false;
    vm.onMemberSelect = onSelect;
    vm.addMember = showAddModal;
    vm.loadMoreTeammates = loadMoreTeammates;
    vm.memberIsSelected = memberIsSelected;
    vm.promote = promote;
    vm.demote = demote;
    vm.remove = remove;

    vm.teammates = [];
    vm.selectedMates = {};
    vm.memberOptions = {
      'creators': NstSvcTranslation.get("Manager(s) only"),
      'everyone': NstSvcTranslation.get("All Members")
    };
    vm.teammatesSettings = {
      skip: 0,
      limit: defaultTeammatesLimit,
      creatorsCount: 0,
      keyHoldersCount: 0,
      pendingsCount: 0
    };

    vm.hasAddMembersAccess = vm.place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
    vm.hasSeeMembersAccess = vm.place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);
    vm.hasRemoveAccess = vm.place.hasAccess(NST_PLACE_ACCESS.REMOVE_MEMBERS);
    vm.hasControlAccess = vm.place.hasAccess(NST_PLACE_ACCESS.CONTROL);
    vm.isGrandPlace = vm.place.id.split('.').length === 1 ? true : false;

    (function () {

      loadTeammates(vm.place.id,
        vm.hasSeeMembersAccess && vm.place.id !== NstSvcAuth.user.id,
        vm.hasControlAccess && vm.place.id !== NstSvcAuth.user.id)
        .then(function (teammates) {
          vm.hasMoreTeammates = teammates.length === defaultTeammatesLimit;
          vm.teammates = teammates;
        })

    })();

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
      return loadTeammates(vm.place.id, vm.hasSeeMembersAccess, vm.hasControlAccess).then(function (teammates) {
        vm.teammates.push.apply(vm.teammates, teammates);
        vm.hasMoreTeammates = teammates.length === defaultTeammatesLimit;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.teammatesLoadProgress = false;
      });
    }

    function getCreators(placeId, limit, skip, hasAccess) {
      var deferred = $q.defer();
      if (hasAccess && vm.teammatesSettings.creatorsCount < vm.place.counters.creators) {

        NstSvcPlaceFactory.getCreators(placeId, limit, skip).then(function (result) {

          var creatorItems = _.map(result.creators, function (item) {
            return new NstVmMemberItem(item, 'creator');
          });

          deferred.resolve({
            creators: creatorItems,
            total: result.total
          });
        }).catch(deferred.reject);

      } else {
        deferred.resolve({
          creators: []
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
            keyHolders: keyHolderItems,
            total: result.total
          });
        }).catch(deferred.reject);
      } else {
        deferred.resolve({
          keyHolders: []
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

    function onSelect(member) {
      if (memberIsSelected(member)) {
        delete vm.selectedMates[member.id];
      } else {
        vm.selectedMates[member.id] = member;
      }

      vm.SelectedMembersCount = Object.keys(vm.selectedMates).length;
      selectedCreatorsCalculator();
      selectedKeyHoldersCalculator();
    }

    function memberIsSelected(member) {
      return vm.selectedMates[member.id]
    }

    function showAddModal(role) {
      var role = role || NST_PLACE_MEMBER_TYPE.KEY_HOLDER;

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

    function selectedCreatorsCalculator() {
      var count = 0;
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.CREATOR) {
          count++;
        }
      }
      vm.selectedCreatorsCount = count;
    }

    function selectedKeyHoldersCalculator() {
      var count = 0;
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
          count++;
        }
      }
      vm.selectedKeyHoldersCount = count;
    }

    function getSelectedCreators() {
      var creators = [];
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.CREATOR) {
          creators.push(vm.selectedMates[key]);
        }
      }
      return creators;
    }

    function getSelectedKeyHolders() {
      var keyHolders = [];
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
          keyHolders.push(vm.selectedMates[key]);
        }
      }
      return keyHolders;
    }

    function getSelectedMembers() {
      var members = [];
      for (var key in vm.selectedMates) {
        members.push(vm.selectedMates[key]);
      }
      return members;
    }

    function hasAnyTeammate() {
      return vm.teammates && vm.teammates.length > 0;
    }

    function promote() {
      NstSvcModal.confirm(
        NstSvcTranslation.get('Promote Members'),
        NstUtility.string.format(NstSvcTranslation.get('Are you sure to promote {0} of members?'), vm.selectedKeyHoldersCount),
        {
          yes: NstSvcTranslation.get("Confirm"),
          no: NstSvcTranslation.get("Cancel")
        }
      ).then(function (result) {
        if (result) {
          var members = getSelectedKeyHolders();
          _.forEach(members, function (member) {
            NstSvcPlaceFactory.promoteMember(vm.place.id, member.id).then(function (result) {
              var mem = vm.teammates.filter(function (m) {
                return m.id === member.id
              })[0];
              if (mem) mem.role = NST_PLACE_MEMBER_TYPE.CREATOR;
              selectedCreatorsCalculator();
              selectedKeyHoldersCalculator();
            }).catch(function (error) {
              $log.debug(error);
            });
          });
        }
      });
    }

    function demote() {
      NstSvcModal.confirm(
        NstSvcTranslation.get('Demote Members'),
        NstUtility.string.format(NstSvcTranslation.get('Are you sure to demote {0} of members?'), vm.selectedCreatorsCount),
        {
          yes: NstSvcTranslation.get("Confirm"),
          no: NstSvcTranslation.get("Cancel")
        }
      ).then(function (result) {
        if (result) {
          var members = getSelectedCreators();
          _.forEach(members, function (member) {
            NstSvcPlaceFactory.demoteMember(vm.place.id, member.id).then(function (result) {
              var mem = vm.teammates.filter(function (m) {
                return m.id === member.id
              })[0];
              if (mem) mem.role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
              selectedCreatorsCalculator();
              selectedKeyHoldersCalculator();
            }).catch(function (error) {
              $log.debug(error);
            });
          });
        }
      });
    }

    function remove() {

      NstSvcModal.confirm(
        NstSvcTranslation.get('Remove Member'),
        NstUtility.string.format(NstSvcTranslation.get('Are you sure to remove {0} of members?'), vm.SelectedMembersCount),
        {
          yes: NstSvcTranslation.get("Confirm"),
          no: NstSvcTranslation.get("Cancel")
        }
      ).then(function (result) {
        if (result) {
          var members = getSelectedMembers();
          _.forEach(members, function (member) {
            removeMember(member).then(function (result) {
              return NstSvcPlaceFactory.get(vm.place.id);
            }).then(function (place) {

              vm.teammates = _.remove(vm.teammates, function (m) {
                return m.id !== member.id;
              });
              delete vm.selectedMates[member.id];
              vm.SelectedMembersCount = Object.keys(vm.selectedMates).length;

              selectedCreatorsCalculator();
              selectedKeyHoldersCalculator();

              if (!member.isPending()) {
                NstSvcPlaceFactory.set(place);
                $scope.$emit('member-removed', {
                  member: member
                });
              }

            }).catch(function (error) {
              if (error instanceof NstPlaceOneCreatorLeftError) {
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('User {0} is the only Manager of this Place!'), vm.member.name));
              } else if (error instanceof NstPlaceCreatorOfParentError) {
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to remove {0}, because he/she is the creator of its highest-ranking Place ({1}).'), vm.member.name, vm.place.parent.name));
              } else {
                toastr.error(NstUtility.string.format(NstSvcTranslation.get('An error has occured while trying to remove the member')));
              }
            });
          });
        }
      });
      return;
    }

    function removeMember(member) {
      return member.isPending() ? NstSvcInvitationFactory.revoke(member.InvitationId) : NstSvcPlaceFactory.removeMember(vm.place.id, member.id);
    }

  }
})();
