(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('placeTeammatesController', placeTeammatesController);

  /** @ngInject */
  function placeTeammatesController($scope, $q, $stateParams, $uibModal, toastr,
    NstSvcPlaceFactory, NstUtility,NstSvcAuth, NstSvcPlaceAccess,
    NstVmMemberItem, NST_SRV_ERROR,
    NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NstSvcLogger) {
    var vm = this;

    vm.mode = 'collapsed';
    vm.limit = 0;
    vm.hasAddMembersAccess = false;
    vm.hasSeeMembersAccess = false;
    vm.loading = false;
    vm.showTemmate = true;
    vm.teammates = [];

    vm.placeId = $stateParams.placeId;

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
        vm.placeId = $stateParams.placeId;
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

      NstSvcPlaceAccess.getIfhasAccessToRead(vm.placeId).then(function (place) {
        if (place) {
          vm.place = place;
          $q.all([
            NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_MEMBERS),
            NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.SEE_MEMBERS),
          ]).then(function(values) {
            vm.hasAddMembersAccess = values[0];
            vm.hasSeeMembersAccess = values[1];

            if (vm.mode = 'collapsed') {
              collapse();
            }

            vm.showTeammate = (vm.placeId.split('.')[0] !== NstSvcAuth.user.id);

            findMembers();
          }).catch(function(error) {
            NstSvcLogger.error(error);
          }).finally(function () {
            vm.loading = false;
          });
        }
      }).catch(function (error) {

      });
    };


    function expand() {
      vm.limit = 64;
      vm.onCollapse(false);
      findMembers();
    }

    function collapse() {
      vm.onCollapse(true);
      if (vm.hasAddMembersAccess) {
        vm.limit = 4;
      } else {
        vm.limit = 5;
      }
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
            if (vm.placeId.split('.').length === 1) {
              NstSvcPlaceFactory.inviteUser(vm.place, role, user).then(function (invitationId) {
                toastr.success(NstUtility.string.format('User "{0}" has been invited to Place "{1}" successfully.', user.id, vm.placeId));
                NstSvcLogger.info(NstUtility.string.format('User "{0}" has been invited to Place "{1}" successfully.', user.id, vm.placeId));
                resolve({
                  user: user,
                  role: role,
                  invitationId: invitationId
                });
              }).catch(function (error) {
                // FIXME: Why cannot catch the error!
                if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
                  toastr.warning(NstUtility.string.format('User "{0}" was previously invited to Place "{1}".', user.id, vm.placeId));
                  NstSvcLogger.error(NstUtility.string.format('User "{0}" was previously invited to Place "{1}".', user.id, vm.placeId));
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
                toastr.success(NstUtility.string.format('User "{0}" has been added to Place "{1}" successfully.', user.id, vm.placeId));
                NstSvcLogger.info(NstUtility.string.format('User "{0}" has been added to Place "{1}" successfully.', user.id, vm.placeId));
                resolve({
                  user: user,
                  role: role,
                  invitationId: addId
                });
              }).catch(function (error) {
                // FIXME: Why cannot catch the error!
                if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
                  toastr.warning(NstUtility.string.format('User "{0}" was previously added to Place "{1}".', user.id, vm.placeId));
                  NstSvcLogger.error(NstUtility.string.format('User "{0}" was previously added to Place "{1}".', user.id, vm.placeId));
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

    function findMembers() {
      if (vm.hasSeeMembersAccess) {
        vm.loading = true;
        NstSvcPlaceFactory.getMembers(vm.placeId, vm.limit).then(function(members) {
          vm.teammates = _.concat(_.map(members.creators, function(member) {
            return new NstVmMemberItem(member, 'creator');
          }), _.map(members.keyHolders, function(member) {
            return new NstVmMemberItem(member, 'key_holder');
          }));
          vm.showTemmate = true;
        }).finally(function () {
          vm.loading = false;
        });
      } else {
        vm.showTemmate = false;
        vm.teammates = [];
      }
    }

  }
})();
