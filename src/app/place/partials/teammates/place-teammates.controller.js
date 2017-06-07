(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('placeTeammatesController', placeTeammatesController);

  /** @ngInject */
  function placeTeammatesController($scope, $q, $state, $stateParams, $uibModal, toastr, _, $rootScope,
                                    NstSvcPlaceFactory, NstUtility, NstSvcAuth, NstSvcUserFactory, NstSvcTranslation, NstSvcWait,
                                    NstVmMemberItem, NST_SRV_ERROR, NST_NOTIFICATION_TYPE, NstEntityTracker,
                                    NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NstSvcLogger) {
    var vm = this;
    // to keep track of added users
    var removedMembersTracker = new NstEntityTracker(),
      addedMembersTracker = new NstEntityTracker(),
      eventReferences = [],
      addMemberListenerKey = null;

    vm.hasAddMembersAccess = false;
    vm.hasSeeMembersAccess = false;
    vm.openMemberModal = openMemberModal;
    vm.loading = false;
    vm.teammates = [];

    vm.placeId = $stateParams.placeId;
    vm.teammatesSettings = {
      skip: 0,
      limit: 18,
      creatorsCount: 0,
      keyHoldersCount: 0,
      pendingsCount: 0
    };

    eventReferences.push($rootScope.$on(NST_NOTIFICATION_TYPE.INVITE_RESPOND, function (event, data) {
      if (vm.placeId === data.invitation.place.id) {
        NstSvcPlaceFactory.get(vm.placeId, true).then(function (place) {
          vm.place = place;
        }).catch(function (error) {
        });

        if (vm.teammates.length < vm.teammatesSettings.limit) {
          NstSvcUserFactory.get(data.invitation.invitee.id)
            .then(function (user) {
              vm.teammates.push(new NstVmMemberItem(user, NST_PLACE_MEMBER_TYPE.KEY_HOLDER))
            })
            .catch(function (error) {
            });

          addedMembersTracker.track(data.invitation.invitee.id);
        }
      }
    }));

    eventReferences.push($rootScope.$on('member-removed', function (event, data) {

      if (vm.placeId === data.place.id) {
        if (removedMembersTracker.isTracked(data.member.id)) {
          return;
        }
        vm.place = data.place;
        load();
        removedMembersTracker.track(data.member.id);
      }
    }));

    eventReferences.push($rootScope.$on('member-added', function (event, data) {
      if (vm.placeId === data.place.id) {
        if (addedMembersTracker.isTracked(data.member.id)) {
          return;
        }

        vm.place = data.place;
        load();
        addedMembersTracker.track(data.member.id);
      }
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


    initialize();

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.addMember = addMember;

    vm.isGrand = !NstUtility.place.hasParent(vm.placeId);

    function initialize() {
      if (!vm.placeId) {
        return;
      }

      vm.loading = true;


      // fixme :: check Waiting
      // NstSvcWait.all(['main-done'], function () {
      NstSvcPlaceFactory.get(vm.placeId).then(function (place) {
        if (place) {
          vm.place = place;

          vm.hasAddMembersAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
          vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);

          load();
        }
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.loading = false;
      });
      // });
    }

    function openMemberModal() {
      console.log('here');
      $state.go('app.place-settings', { placeId : vm.placeId, tab : 'members' }, { notify : false });
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
          invite(vm.place, selectedUsers);
        } else {
          add(vm.place, selectedUsers);
        }
      });
    }



    function add(place, users) {
      NstSvcPlaceFactory.addUser(place, users).then(function (result) {
        // show the users that were added successfully
        vm.teammates.push.apply(vm.teammates, _.map(result.addedUsers, function (member) {
          return new NstVmMemberItem(member, NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
        }));
        // dispatch the required events
        NstSvcPlaceFactory.get(place.id, true).then(function (newPlace) {
          vm.place = newPlace;
          var dispatcher = _.partial(dispatchUserAdded, newPlace);
          _.forEach(result.addedUsers, dispatcher);
        });


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

    function invite(place, users) {
      NstSvcPlaceFactory.inviteUser(place, users).then(function (result) {
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

    function dispatchUserAdded(place, user) {
      eventReferences.push($rootScope.$emit(
        'member-added',
        {
          place: place,
          member: user
        }
      ));
    }

    function addMember() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
    }

    function loadTeammates(placeId, hasSeeMembersAccess) {
      var deferred = $q.defer();

      var teammates = [];
      getCreators(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, hasSeeMembersAccess).then(function (creators) {
        teammates.push.apply(teammates, creators);

        return getKeyholders(placeId, vm.teammatesSettings.limit - creators.length - ( vm.hasAddMembersAccess ? 1 : 0 ), vm.teammatesSettings.skip, hasSeeMembersAccess);
      }).then(function (keyHolders) {

        teammates.push.apply(teammates, keyHolders);

        deferred.resolve(teammates);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function load() {

      if (vm.hasSeeMembersAccess) {

        loadTeammates(vm.placeId, vm.hasSeeMembersAccess).then(function (teammates) {
          vm.teammates = teammates;
        }).finally(function () {
          vm.loading = false;
        });
      } else {
        vm.teammates = [];
      }
    }

    function getCreators(placeId, limit, skip, hasAccess) {
      var deferred = $q.defer();

      if (hasAccess && vm.teammatesSettings.creatorsCount < vm.place.counters.creators) {

        NstSvcPlaceFactory.getCreators(placeId, limit, skip).then(function (data) {
          var creatorItems = _.map(data.creators, function (item) {
            return new NstVmMemberItem(item, 'creator');
          });

          deferred.resolve(creatorItems);
        }).catch(deferred.reject);

      } else {
        deferred.resolve([]);
      }

      return deferred.promise;
    }

    function getKeyholders(placeId, limit, skip, hasAccess) {
      var deferred = $q.defer();

      if (limit > 0 && hasAccess && vm.teammatesSettings.keyHoldersCount < vm.place.counters.key_holders) {
        NstSvcPlaceFactory.getKeyholders(placeId, limit, skip).then(function (data) {
          var keyHolderItems = _.map(data.keyHolders, function (item) {
            return new NstVmMemberItem(item, 'key_holder');
          });

          deferred.resolve(keyHolderItems);
        }).catch(deferred.reject);
      } else {
        deferred.resolve([]);
      }

      return deferred.promise;
    }


    $scope.$on('$destroy', function () {
      if (addMemberListenerKey) {
        NstSvcPlaceFactory.removeEventListener(addMemberListenerKey);
      }

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
