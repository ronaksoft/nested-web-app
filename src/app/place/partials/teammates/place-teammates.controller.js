(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('placeTeammatesController', placeTeammatesController);

  /** @ngInject */
  function placeTeammatesController($scope, $q, $stateParams, $uibModal, toastr, _, $rootScope,
    NstSvcPlaceFactory, NstUtility,NstSvcAuth, NstSvcPlaceAccess, NstSvcTranslation, NstSvcWait,
    NstVmMemberItem, NST_SRV_ERROR, NST_PLACE_FACTORY_EVENT, NstEntityTracker,
    NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NstSvcLogger) {
    var vm = this;
    // to keep track of added users
    var removedMembersTracker = new NstEntityTracker(),
        addedMembersTracker = new NstEntityTracker(),
        eventReferences = [],
        addMemberListenerKey = null;

    vm.hasAddMembersAccess = false;
    vm.hasSeeMembersAccess = false;
    vm.loading = false;
    vm.teammates = [];

    vm.placeId = $stateParams.placeId;
    vm.teammatesSettings = {
      skip : 0,
      limit : 24,
      creatorsCount : 0,
      keyHoldersCount : 0,
      pendingsCount : 0
    };

    eventReferences.push($rootScope.$on('member-removed', function (event, data) {
      if (vm.placeId === data.placeId) {

        if (removedMembersTracker.isTracked(data.member.id)) {
          return;
        }

        NstUtility.collection.dropById(vm.teammates, data.member.id);
        NstSvcPlaceFactory.get(vm.place.id).then(function (place) {
          vm.place = place;
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get("An error has occured"));
        });

        removedMembersTracker.track(data.member.id);
      }
    }));

    eventReferences.push($rootScope.$on('member-added', function (event, data) {
      if (vm.placeId === data.placeId) {
        if (addedMembersTracker.isTracked(data.member.id)) {
          return;
        }

        NstSvcPlaceFactory.get(vm.place.id).then(function (place) {
          vm.place = place;
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get("An error has occured"));
        });
        addedMembersTracker.track(data.member.id);
      }
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

      NstSvcWait.all(['messages-done'], function () {
        NstSvcPlaceFactory.get(vm.placeId).then(function(place) {
          if (place) {
            vm.place = place;

            vm.hasAddMembersAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
            vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);

            load();
          }
        }).catch(function(error) {
          NstSvcLogger.error(error);
        }).finally(function() {
          vm.loading = false;
        });
      });
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

        var successRes = [];
        var failedRes = [];

        $q.all(_.map(selectedUsers, function(user) {

          return $q(function(resolve, reject) {
            if (vm.placeId.split('.').length === 1) {
              NstSvcPlaceFactory.inviteUser(vm.place, role, user).then(function (invitationId) {
                successRes.push(user.id);

                resolve({
                  user: user,
                  role: role,
                  invitationId: invitationId
                });
              }).catch(function (error) {

                failedRes.push(user.id);
                // FIXME: Why cannot catch the error!
                if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
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
            }else{
              NstSvcPlaceFactory.addUser(vm.place, role, user).then(function (addId) {

                successRes.push(user.id);

                resolve({
                  user: user,
                  role: role,
                  invitationId: addId
                });
              }).catch(function (error) {
                // FIXME: Why cannot catch the error!
                if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {

                  failedRes.push(user.id);

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
            }
          });

        })).then(function(values) {
          _.forEach(values, function(result) {
            if (!result.duplicate) {
              if (result.role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
                if (vm.placeId.split('.').length > 1)
                  vm.teammates.push(new NstVmMemberItem(result.user, result.role));
              }
            }
          });

          if (successRes.length > 0) {
            toastr.success(NstUtility.string.format(NstSvcTranslation.get('{0} user/s has been {1} to Place "{2}" successfully.'), successRes.length, vm.placeId.split('.').length === 1 ? 'invited' : 'added', vm.place.id));
          }
          if (failedRes > 0) {
            if (vm.placeId.split('.').length === 1) {
              toastr.error(NstUtility.string.format(NstSvcTranslation.get('{0} user/s has not been invited to Place {1}.'), failedRes.length, vm.place.id));
            } else {
              toastr.error(NstUtility.string.format(NstSvcTranslation.get('{0} user/s has not been added to Place {1}.'), failedRes.length, user.id, vm.place.id) + " " + failedRes.join(','));
            }
          }

        }).catch(function(error) {
          NstSvcLogger.error(error);
        });
      });
    }

    function addMember() {
      showAddModal(NST_PLACE_MEMBER_TYPE.KEY_HOLDER);
    }

    function loadTeammates(placeId, hasSeeMembersAccess) {
      var deferred = $q.defer();

      var teammates = [];
      getCreators(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, hasSeeMembersAccess).then(function(creators) {
        teammates.push.apply(teammates, creators);

        return getKeyholders(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, hasSeeMembersAccess);
      }).then(function(keyHolders) {

        teammates.push.apply(teammates, keyHolders);

        deferred.resolve(teammates);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function load() {

      if (vm.hasSeeMembersAccess) {
        vm.loading = true;

        loadTeammates(vm.placeId, vm.hasSeeMembersAccess).then(function(teammates) {
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

        NstSvcPlaceFactory.getCreators(placeId, limit, skip).then(function(data) {
          var creatorItems = _.map(data.creators, function(item) {
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
        NstSvcPlaceFactory.getKeyholders(placeId, limit, skip).then(function(data) {
          var keyHolderItems = _.map(data.keyHolders, function(item) {
            return new NstVmMemberItem(item, 'key_holder');
          });

          deferred.resolve(keyHolderItems);
        }).catch(deferred.reject);
      } else {
        deferred.resolve([]);
      }

      return deferred.promise;
    }


    $scope.$on('$destroy', function() {
      if (addMemberListenerKey) {
        NstSvcPlaceFactory.removeEventListener(addMemberListenerKey);
      }

      _.forEach(eventReferences, function(cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
