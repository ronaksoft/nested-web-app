(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('placeTeammatesController', placeTeammatesController);

  /** @ngInject */
  function placeTeammatesController($scope, $q, $stateParams, $uibModal, toastr, _, $rootScope,
    NstSvcPlaceFactory, NstUtility,NstSvcAuth, NstSvcPlaceAccess, NstSvcTranslation,
    NstVmMemberItem, NST_SRV_ERROR, NST_PLACE_FACTORY_EVENT,
    NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NstSvcLogger) {
    var vm = this;
    // to keep track of added users
    var addedMemberIds = [];

    var defaultCollapseLimit = 24;
    vm.mode = 'collapsed';
    vm.limit = 0;
    vm.hasAddMembersAccess = false;
    vm.hasSeeMembersAccess = false;
    vm.loading = false;
    vm.showTemmate = true;
    vm.teammates = [];

    vm.placeId = $stateParams.placeId;
    vm.teammatesSettings = {
      skip : 0,
      limit : defaultCollapseLimit,
      creatorsCount : 0,
      keyHoldersCount : 0,
      pendingsCount : 0
    };
    $rootScope.$on('member-removed', function (event, data) {
      NstUtility.collection.dropById(vm.teammates, data.member.id);
      if (data.member.role === 'creator') {
        vm.place.counters.creators --;
      } else {
        vm.place.counters.key_holders --;
      }
    });

    initialize();

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.addMember = addMember;
    vm.toggleMode = toggleMode;

    $scope.$watch(function() {
      return $stateParams.placeId;
    }, function(newValue, oldValue) {
      if (newValue) {
        vm.placeId = newValue;
        initialize();
      }else{
        vm.showTeammate = false;
      }
    });

    function initialize() {
      if (!vm.placeId) {
        return;
      }
      vm.loading = true;

      NstSvcPlaceFactory.get(vm.placeId).then(function(place) {
        if (place) {
          vm.place = place;

          vm.hasAddMembersAccess = place.hasAccess(NST_PLACE_ACCESS.ADD_MEMBERS);
          vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);
          defaultCollapseLimit = vm.hasAddMembersAccess ? defaultCollapseLimit : defaultCollapseLimit + 1;

          if (vm.mode = 'collapsed') {
            collapse();
          }

          vm.showTeammate = (vm.placeId.split('.')[0] !== NstSvcAuth.user.id);

          load();

        }
      }).catch(function(error) {
        NstSvcLogger.error(error);
      }).finally(function() {
        vm.loading = false;
      });

      NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.ADD_MEMBER, function (event) {
        if (event.detail.placeId === vm.place.id && !_.includes(addedMemberIds, event.detail.member.id)) {
          vm.place.counters.key_holders ++;
          addedMemberIds.push(event.detail.member.id);
        }
      });
    }

    function expand() {
      vm.limit = 64;
      vm.skip = 0;
      // vm.onCollapse(false);
      load();
    }

    function collapse() {
      // vm.onCollapse(true);
      vm.limit = defaultCollapseLimit;
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

    function toggleMode() {
      if (vm.mode === 'collapsed') {
        expand();
        vm.mode = 'expanded';
      } else {
        collapse();
        vm.mode = 'collapsed';
      }
    }


    function loadTeammates(placeId, hasSeeMembersAccess) {
      var deferred = $q.defer();

      var teammates = [];
      var pageCounts = {
        creators : 0,
        keyHolders : 0,
        pendings : 0
      };
      vm.teammatesSettings.limit = defaultCollapseLimit;
      vm.teammatesSettings.skip = vm.teammatesSettings.creatorsCount;

      getCreators(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, hasSeeMembersAccess).then(function(creators) {

        pageCounts.creators = creators.length;
        vm.teammatesSettings.limit = defaultCollapseLimit - pageCounts.creators;
        vm.teammatesSettings.creatorsCount += creators.length;
        vm.teammatesSettings.skip = vm.teammatesSettings.keyHoldersCount;

        teammates.push.apply(teammates, creators);

        return getKeyholders(placeId, vm.teammatesSettings.limit, vm.teammatesSettings.skip, hasSeeMembersAccess);
      }).then(function(keyHolders) {

        pageCounts.keyHolders = keyHolders.length;
        vm.teammatesSettings.limit = defaultCollapseLimit - pageCounts.keyHolders - pageCounts.creators;
        vm.teammatesSettings.keyHoldersCount += keyHolders.length;

        teammates.push.apply(teammates, keyHolders);

        deferred.resolve(teammates);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function loadMore() {
      vm.teammatesLoadProgress = true;
      return loadTeammates(vm.placeId, vm.hasSeeMembersAccess).then(function (teammates) {
        vm.teammates.push.apply(vm.teammates, teammates);
        vm.hasMoreTeammates = teammates.length === defaultCollapseLimit;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      }).finally(function () {
        vm.loading = false;
      });
    }

    function load() {
      vm.teammatesSettings = {
        skip : 0,
        limit : defaultCollapseLimit,
        creatorsCount : 0,
        keyHoldersCount : 0,
        pendingsCount : 0
      };
      if (vm.hasSeeMembersAccess) {
        vm.loading = true;

        loadTeammates(vm.placeId, vm.hasSeeMembersAccess).then(function(teammates) {
          vm.teammates = teammates;
          vm.showTemmate = true;
        }).finally(function () {
          vm.loading = false;
        });
      } else {
        vm.showTemmate = false;
        vm.teammates = [];
      }
    }

    function getCreators(placeId, limit, skip, hasAccess) {
      var deferred = $q.defer();

      if (hasAccess && vm.teammatesSettings.creatorsCount < vm.place.counters.creators) {

        NstSvcPlaceFactory.getCreators(placeId, limit, skip).then(function(creators) {
          var creatorItems = _.map(creators, function(item) {
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
        NstSvcPlaceFactory.getKeyholders(placeId, limit, skip).then(function(keyHolders) {
          var keyHolderItems = _.map(keyHolders, function(item) {
            return new NstVmMemberItem(item, 'key_holder');
          });

          deferred.resolve(keyHolderItems);
        }).catch(deferred.reject);
      } else {
        deferred.resolve([]);
      }

      return deferred.promise;
    }


  }
})();
