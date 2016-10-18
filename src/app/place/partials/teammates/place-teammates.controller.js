(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('placeTeammatesController', placeTeammatesController);

  /** @ngInject */
  function placeTeammatesController($scope, $q, $log, $uibModal, toastr,
    NstSvcPlaceFactory, NstUtility,NstSvcAuth,
    NstVmMemberItem, NST_SRV_ERROR,
    NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE) {
    var vm = this;

    vm.mode = 'collapsed';
    vm.limit = 0;
    vm.hasAddMembersAccess = false;
    vm.hasSeeMembersAccess = false;
    vm.loading = false;
    vm.showTemmate = true;
    vm.teammates = [];


    initialize();

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.addMember = addMember;
    vm.toggleMode = toggleMode;

    $scope.$watch(function() {
      return vm.grandPlace;
    }, function(newValue, oldValue) {
      if (newValue) {
        console.log("newValue", newValue);
        initialize();
      }else{
        vm.showTemmate = false;
      }
    });

    function initialize() {
      if (!vm.grandPlace) {
        return;
      }
      vm.loading = true;

      $q.all([
        NstSvcPlaceFactory.hasAccess(vm.grandPlace.id, NST_PLACE_ACCESS.ADD_MEMBERS),
        NstSvcPlaceFactory.hasAccess(vm.grandPlace.id, NST_PLACE_ACCESS.SEE_MEMBERS),
      ]).then(function(values) {

        vm.hasAddMembersAccess = values[0];
        vm.hasSeeMembersAccess = values[1];

        if (vm.mode = 'collapsed') {
          collapse();
        }

        vm.showTemmate = (vm.grandPlace.id !== NstSvcAuth.user.id);

        findMembers();
      }).catch(function(error) {
        $log.debug(error);
      }).finally(function () {
        vm.loading = false;
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
            return vm.grandPlace;
          }
        }
      });

      modal.result.then(function(selectedUsers) {
        $q.all(_.map(selectedUsers, function(user) {

          return $q(function(resolve, reject) {
            NstSvcPlaceFactory.addUser(vm.grandPlace, role, user).then(function(invitationId) {
              toastr.success(NstUtility.string.format('User "{0}" was invited to Place "{1}" successfully.', user.id, vm.grandPlace.id));
              $log.debug(NstUtility.string.format('User "{0}" was invited to Place "{1}" successfully.', user.id, vm.grandPlace.id));
              resolve({
                user: user,
                role: role,
                invitationId: invitationId
              });
            }).catch(function(error) {
              // FIXME: Why cannot catch the error!
              if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
                toastr.warning(NstUtility.string.format('User "{0}" was previously invited to Place "{1}".', user.id, vm.grandPlace.id));
                $log.debug(NstUtility.string.format('User "{0}" was previously invited to Place "{1}".', user.id, vm.grandPlace.id));
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
                // vm.teammates.push(new NstVmMemberItem(result.user, 'pending_' + result.role));
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
        NstSvcPlaceFactory.getMembers(vm.grandPlace.id, vm.limit).then(function(members) {
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
