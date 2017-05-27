(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMemberSettingsController', PlaceMemberSettingsController);

  /** @ngInject */
  function PlaceMemberSettingsController(_, $q, $uibModal, toastr, $scope, $rootScope,
                                         NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_SRV_ERROR,
                                         NstSvcPlaceFactory, NstSvcInvitationFactory, NstVmMemberItem,
                                         NstSvcAuth, NstSvcModal,
                                         NstUtility, NstSvcTranslation, NstSvcLogger) {

    var defaultTeammatesLimit = 16;

    var vm = this;
    var eventReferences = [];

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
          },
          mode: function () {
            return false
          },
          isForGrandPlace: function () {
            return undefined
          }
        }
      });

      modal.result.then(function (selectedUsers) {
        if (NstUtility.place.isGrand(vm.place.id)) {
          inviteUsers(vm.place, selectedUsers);
        } else {
          addUsers(vm.place, selectedUsers);
        }
      });
    }

    function addUsers(place, users) {
      NstSvcPlaceFactory.addUser(place, users).then(function (result) {
        // dispatch the required events
        var dispatcher = _.partial(dispatchUserAdded, place);
        _.forEach(result.addedUsers, dispatcher);

        // notify the user about the result of adding
        if (_.size(result.rejectedUsers) === 0
          && _.size(result.addedUsers) > 0) {
          toastr.success(NstUtility.string.format(NstSvcTranslation.get('All selected users have been added to place {0} successfully.'), place.name));
        } else {

          // there are users that we were not able to add them
          if (_.size(result.rejectedUsers) > 0) {
            var names = _(result.rejectedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('We are not able to add these users to the place:');
            toastr.warning(message + '<br/>' + names);
          }

          //there are some users that were added successfully
          if (_.size(result.addedUsers) > 0) {
            var names = _(result.addedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('These users have been added:');
            toastr.success(message + '<br/>' + names);
          }
        }
      }).catch(function (error) {
        toastr.warning(NstSvcTranslation.get('An error has occured while adding the user(s) to the place!'));
      });
    }

    function dispatchUserAdded(place, user) {
      eventReferences.push($rootScope.$emit(
        'member-added',
        {
          placeId: place.id,
          member: user
        }
      ));
    }

    function inviteUsers(place, users) {
      NstSvcPlaceFactory.inviteUser(place, users).then(function (result) {
        // TODO: dispatch the required events

        // notify the user about the result of adding
        if (_.size(result.rejectedUsers) === 0
          && _.size(result.addedUsers) > 0) {
          toastr.success(NstUtility.string.format(NstSvcTranslation.get('All selected users have been invited to place {0} successfully.'), place.name));
        } else {

          // there are users that we were not able to invite them
          if (_.size(result.rejectedUsers) > 0) {
            var names = _(result.rejectedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('We are not able to invite these users to the place:');
            toastr.warning(message + '<br/>' + names);
          }

          //there are some users that were invited successfully
          if (_.size(result.addedUsers) > 0) {
            var names = _(result.addedUsers).map(function (user) {
              return NstUtility.string.format('{0} (@{1})', user.fullName, user.id);
            }).join('<br/>');
            var message = NstSvcTranslation.get('These users have been invited:');
            toastr.success(message + '<br/>' + names);
          }
        }
      }).catch(function (error) {
        toastr.warning(NstSvcTranslation.get('An error has occured while inviting the user(s) to the place!'));
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
      var members = getSelectedKeyHolders();
      var message = null;
      if (members.length < 1) {
        return;
      }

      if (members.length > 1) {
        message = NstUtility.string.format(NstSvcTranslation.get('Are you sure to promote {0} of members?'), members.length);
      } else {
        message = NstUtility.string.format(NstSvcTranslation.get('Are you sure to promote {0}?'), members[0].name);
      }
      NstSvcModal.confirm(
        NstSvcTranslation.get('Promote Members'),
        message,
        {
          yes: NstSvcTranslation.get("Confirm"),
          no: NstSvcTranslation.get("Cancel")
        }
      ).then(function (result) {
        if (result) {
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
      var members = getSelectedCreators();
      var message = null;
      if (members.length < 1) {
        return;
      }

      if (members.length > 1) {
        message = NstUtility.string.format(NstSvcTranslation.get('Are you sure to demote {0} of members?'), members.length);
      } else {
        message = NstUtility.string.format(NstSvcTranslation.get('Are you sure to demote {0}?'), members[0].name);
      }

      NstSvcModal.confirm(
        NstSvcTranslation.get('Demote Members'),
        message,
        {
          yes: NstSvcTranslation.get("Confirm"),
          no: NstSvcTranslation.get("Cancel")
        }
      ).then(function (result) {
        if (result) {
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

    function remove(userId) {
      var members;
      if (userId) {
        members = [userId]
      } else {
        members = getSelectedMembers();
      }
      var message = null;

      if (members.length === 1) {
        message = NstUtility.string.format(NstSvcTranslation.get('Are you sure to remove {0}?'), members[0].fullName);
      } else if (members.length > 1) {
        message = NstUtility.string.format(NstSvcTranslation.get('Are you sure to remove {0} of members?'), members.length);
      } else {
        return;
      }
      NstSvcModal.confirm(
        NstSvcTranslation.get('Remove Member'),
        message,
        {
          yes: NstSvcTranslation.get("Confirm"),
          no: NstSvcTranslation.get("Cancel")
        }
      ).then(function (result) {
        if (result) {
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
                  member: member,
                  placeId: vm.place.id
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


    eventReferences.push($rootScope.$on('member-removed', function (event, data) {
      NstUtility.collection.dropById(vm.teammates, data.member.id);
    }));

    eventReferences.push($rootScope.$on('member-demoted', function (event, data) {
      var member = vm.teammates.filter(function (m) {
        return m.id === data.member.id
      });
      if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
    }));

    eventReferences.push($rootScope.$on('member-promoted', function (event, data) {
      var member = vm.teammates.filter(function (m) {
        return m.id === data.member.id
      });
      if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.CREATOR;
    }));

    $scope.$on('$destroy', function () {

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });

    });
  }
})();
