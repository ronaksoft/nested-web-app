/**
 * @file src/app/place/settings/member/place-member-settings.controller.js
 * @author Sina Hosseini <sinaa@nested.me>
 * @description The user manages the place members.
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMemberSettingsController', PlaceMemberSettingsController);

  /** @ngInject */
  /**
   * A place members are listed here and the user can remove, promote/demote and invite new members
   *
   * @param {any} _
   * @param {any} $q
   * @param {any} $uibModal
   * @param {any} toastr
   * @param {any} $scope
   * @param {any} $rootScope
   * @param {any} NST_PLACE_ACCESS
   * @param {any} NST_PLACE_MEMBER_TYPE
   * @param {any} NST_SRV_ERROR
   * @param {any} NstSvcPlaceFactory
   * @param {any} NstVmMemberItem
   * @param {any} NstSvcAuth
   * @param {any} NstSvcModal
   * @param {any} NstUtility
   * @param {any} NstSvcTranslation
   * @param {any} NstSvcLogger
   */
  function PlaceMemberSettingsController($q, $uibModal, toastr, $scope, $rootScope, $state,
                                         NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_SRV_ERROR,
                                         NstSvcPlaceFactory, NstVmMemberItem,
                                         NstSvcAuth, NstSvcModal,
                                         NstUtility, NstSvcTranslation, NstSvcLogger, _) {

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
    vm.openMemberModal = openMemberModal;

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

    vm.sidebarLimit = vm.hasAddMembersAccess ? 14 : 15;
    (function () {
      // todo: NstSvcAuth.user is empty on direct access
      loadTeammates(vm.place.id,
        vm.hasSeeMembersAccess && vm.place.id !== NstSvcAuth.user.id,
        vm.hasControlAccess && vm.place.id !== NstSvcAuth.user.id)
        .then(function (teammates) {
          vm.hasMoreTeammates = teammates.length === defaultTeammatesLimit;
          vm.teammates = teammates;
        })

    })();

    /**
     * Loads the place creators and key-holders using two separate API and calculates the number of
     * creators or key-holders that should be requested
     *
     * @param {any} placeId
     * @param {any} accessToSeeMembers
     * @param {any} accessToSeePendings
     * @returns
     */
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
        deferred.resolve(teammates);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    /**
     * Opens place-settings page and shows members tab by default
     *
     */
    function openMemberModal() {
      $state.go('app.place-settings', { placeId : vm.place.id, tab : 'members' }, { notify : false });
    }

    /**
     * Loads more teammates and appends to the list
     *
     * @returns
     */
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

    /**
     * Retrieves the place creators with the specified limit and skip. The function returns an
     * empty array if the user does not have the required permissions
     *
     * @param {any} placeId
     * @param {any} limit
     * @param {any} skip
     * @param {any} hasAccess
     * @returns
     */
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

    /**
     * Retrieves the place key-holders with the specified limit and skip. The function returns an
     * empty array if the user does not have the required permissions
     *
     * @param {any} placeId
     * @param {any} limit
     * @param {any} skip
     * @param {any} hasAccess
     * @returns
     */
    function getKeyholders(placeId, limit, skip, hasAccess) {
      var deferred = $q.defer();

      if (limit > 0 && hasAccess /*&& vm.teammatesSettings.keyHoldersCount < vm.place.counters.key_holders*/) {
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

    /**
     * Select/Unselect a member and updates all counters
     *
     * @param {any} member
     */
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

    /**
     * Returns true if the given member has been selected before
     *
     * @param {any} member
     * @returns
     */
    function memberIsSelected(member) {
      return vm.selectedMates[member.id]
    }

    /**
     * Opens add/invite member modal and Adds/Invites the selected members on modal closes
     *
     * @param {any} role
     */
    function showAddModal(role) {

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/settings/place-add-member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'addMemberCtrl',
        size: 'sm',
        resolve: {
          chosenRole: function () {
            return role || NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
          },
          currentPlace: function () {
            return vm.place;
          },
          newPlace: false,
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
          // show the users that were invited successfully
          var role = 'pending_' + NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
          vm.teammates.push.apply(vm.teammates, _.map(selectedUsers, function (member) {
            return new NstVmMemberItem(member, role);
          }));
        } else {
          vm.teammates.push.apply(vm.teammates, _.map(selectedUsers, function (member) {
            return new NstVmMemberItem(member, NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
          }));
        }

      });
    }

    /**
     * Calculates and sets the number of creators
     *
     */
    function selectedCreatorsCalculator() {
      var count = 0;
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.CREATOR) {
          count++;
        }
      }
      vm.selectedCreatorsCount = count;
    }

    /**
     * Calculates and sets the number of key-holders
     *
     */
    function selectedKeyHoldersCalculator() {
      var count = 0;
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
          count++;
        }
      }
      vm.selectedKeyHoldersCount = count;
    }

    /**
     * Returns the selected creators
     *
     * @returns
     */
    function getSelectedCreators() {
      var creators = [];
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.CREATOR) {
          creators.push(vm.selectedMates[key]);
        }
      }
      return creators;
    }

    /**
     * Returns the selected key-holders
     *
     * @returns
     */
    function getSelectedKeyHolders() {
      var keyHolders = [];
      for (var key in vm.selectedMates) {
        if (vm.selectedMates[key].role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
          keyHolders.push(vm.selectedMates[key]);
        }
      }
      return keyHolders;
    }

    /**
     * Returns the selected members
     *
     * @returns
     */
    function getSelectedMembers() {
      var members = [];
      for (var key in vm.selectedMates) {
        members.push(vm.selectedMates[key]);
      }
      return members;
    }

    /**
     * Promotes the selected key-holders and updates all counters. It confirms before performing the action
     *
     * @returns
     */
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
            NstSvcPlaceFactory.promoteMember(vm.place.id, member.id).then(function () {
              var mem = vm.teammates.filter(function (m) {
                return m.id === member.id
              })[0];
              if (mem) mem.role = NST_PLACE_MEMBER_TYPE.CREATOR;
              selectedCreatorsCalculator();
              selectedKeyHoldersCalculator();
            });
          });
        }
      });
    }

    /**
     *
     * Demotes the selected key-holders and updates all counters. It confirms before performing the action
     *
     * @returns
     */
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
            NstSvcPlaceFactory.demoteMember(vm.place.id, member.id).then(function () {
              var mem = vm.teammates.filter(function (m) {
                return m.id === member.id
              })[0];
              if (mem) mem.role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
              selectedCreatorsCalculator();
              selectedKeyHoldersCalculator();
            });
          });
        }
      });
    }

    /**
     * Removes the selected member(s) and updates all counters. It confirms before performing the action.
     *
     * @param {any} userId
     * @returns
     */
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
            removeMember(member).then(function () {
              return NstSvcPlaceFactory.get(vm.place.id, true);
            }).then(function (newPlace) {

              vm.teammates = _.remove(vm.teammates, function (m) {
                return m.id !== member.id;
              });
              delete vm.selectedMates[member.id];
              vm.SelectedMembersCount = Object.keys(vm.selectedMates).length;

              selectedCreatorsCalculator();
              selectedKeyHoldersCalculator();

              NstSvcPlaceFactory.set(newPlace);
              $scope.$emit('member-removed', {
                member: member,
                place: newPlace
              });

            }).catch(function (error) {
              if (error.code === NST_SRV_ERROR.ACCESS_DENIED) {
                switch (error.message[0]) {
                  case 'last_creator':
                    toastr.error(NstUtility.string.format(NstSvcTranslation.get('User {0} is the only Manager of this Place!'), vm.member.name));
                    break;
                  case 'parent_creator':
                    toastr.error(NstUtility.string.format(NstSvcTranslation.get('You are not allowed to remove {0}, because he/she is the creator of its highest-ranking Place ({1}).'), vm.member.name, vm.place.parent.name));
                    break;
                  default:
                    toastr.error(NstUtility.string.format(NstSvcTranslation.get('An error has occurred while trying to remove the member')));
                    break;
                }

                return;
              }

              toastr.error(NstUtility.string.format(NstSvcTranslation.get('An error has occurred while trying to remove the member')));
              console.log(error);
            });
          });
        }
      });
      return;
    }

    /**
     * Removes the member
     *
     * @param {any} member
     * @returns
     */
    function removeMember(member) {
      return NstSvcPlaceFactory.removeMember(vm.place.id, member.id)
    }

    // Listens to member-removed event and removes the given member from the list
    eventReferences.push($rootScope.$on('member-removed', function (event, data) {
      NstUtility.collection.dropById(vm.teammates, data.member.id);
    }));
    // Listens to member-demoted event and demotes the given creator to a key-holder
    eventReferences.push($rootScope.$on('member-demoted', function (event, data) {
      var member = vm.teammates.filter(function (m) {
        return m.id === data.member.id
      });
      if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
    }));
    // Listens to member-promoted event and promotes the given key-holder to a creator
    eventReferences.push($rootScope.$on('member-promoted', function (event, data) {
      var member = vm.teammates.filter(function (m) {
        return m.id === data.member.id
      });
      if (member[0]) member[0].role = NST_PLACE_MEMBER_TYPE.CREATOR;
    }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });

    });
  }
})();
