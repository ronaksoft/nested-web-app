(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceSettingsController', PlaceSettingsController);

  /** @ngInject */
  function PlaceSettingsController($location, $scope, $stateParams, $q, $uibModal, $log,
    NST_STORE_UPLOAD_TYPE, NST_PLACE_ACCESS,
    NstSvcStore, NstSvcAuth, NstSvcPlaceFactory,
    NstPlace) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.members = null;
    vm.options = {
      notification : null
    };
    vm.hasRemoveAccess = null;
    vm.hasAddPlaceAccess = null;
    vm.hasControlAccess = null;
    vm.hasAddMembersAccess = null;
    vm.hasSeeMembersAccess = null;

    vm.updatePrivacy = updatePrivacy;
    vm.setNotification = setNotification;
    vm.update = update;

    (function() {
      vm.place = {};
      vm.placeId = $stateParams.placeId;
      NstSvcPlaceFactory.get(vm.placeId).then(function(place) {
        vm.place = place;

        return $q.all([
          NstSvcAuth.haveAccess(vm.placeId, NST_PLACE_ACCESS.REMOVE_PLACE),
          NstSvcAuth.haveAccess(vm.placeId, NST_PLACE_ACCESS.ADD_PLACE),
          NstSvcAuth.haveAccess(vm.placeId, NST_PLACE_ACCESS.CONTROL),
          NstSvcAuth.haveAccess(vm.placeId, NST_PLACE_ACCESS.ADD_MEMBERS),
          NstSvcAuth.haveAccess(vm.placeId, NST_PLACE_ACCESS.SEE_MEMBERS),
          NstSvcPlaceFactory.getNotificationOption(vm.placeId),
        ]);
      }).then(function(values) {
        vm.hasRemoveAccess = values[0];
        vm.hasAddPlaceAccess = values[1];
        vm.hasControlAccess = values[2];
        vm.hasAddMembersAccess = values[3];
        vm.hasSeeMembersAccess = values[4];
        vm.options.notification = values[5];

        return vm.hasSeeMembersAccess ? NstSvcPlaceFactory.getMembers(vm.placeId)
                                      : $q(function (resolve) {
                                        resolve([]);
                                      });
      }).then(function (members) {
          vm.members = members;
          vm.hasAnyGuest = _.some(vm.members.knownGuests) ||
                           _.some(vm.members.pendingKnownGuests);

          vm.hasAnyTeamate = _.some(vm.members.creators) ||
                             _.some(vm.members.keyHolders) ||
                             _.some(vm.members.pendingKeyHolders);
      }).catch(function(error) {
        $log.debug(error);
      });

    })();

    vm.actions = {
      'leave': {
        name: 'Leave',
        fn: function() {
          vm.leaveModal();
        }
      }
    };

    $scope.checkplace = function(PlaceId) {
      if (PlaceId == $scope.place.id) {
        $scope.deleteValidated = true;
      } else {
        $scope.deleteValidated = false;
      }
    };

    vm.showAddModal = function(role) {
      $scope.role = role;
      $scope['add_' + role] = true;

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/add_member.html',
        controller: 'PlaceAddMemberController',
        controllerAs: 'place_add_member',
        size: 'sm',
        scope: $scope
      });


      $scope.closeModal = modal.close;

      modal.closed.then(function() {
        delete $scope['add_' + role];
        delete $scope.role;
        delete $scope.closeModal;
      });
    };
    vm.showLockModal = function(event) {
      event.preventDefault();
      event.stopPropagation();

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/warning.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function() {
        var data = {};
        data['privacy.locked'] = $scope.place.privacy.locked;

        return $scope.place.update(data);
      }).catch(function() {
        $scope.place.privacy.locked = !$scope.place.privacy.locked;
      });

      return false;
    };
    vm.showDeleteModal = function() {

      $scope.deleteValidated = false;
      $scope.nextStep = false;

      var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/places/option/delete.html',
          controller: 'WarningController',
          size: 'sm',
          scope: $scope
        })
        .result.then(
          function() {
            if ($scope.deleteValidated == true) {
              $scope.place.delete();
              return $q(function(res) {
                res($scope.place.id);
                $location.path('/places').replace();
              })
            }
          },
          function() {
            console.log("canceled")
          }
        );

    };

    vm.removeMember = function(user) {
      $scope.member = user;

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/places/context_menu/remove.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function() {
        return $scope.place.removeMember($scope.member.username);
      });
    };

    vm.leaveModal = function() {

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/leave.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function() {
        return $scope.place.removeMember(NstSvcAuth.user.username).then(function() {
          $location.path('/places').replace();

          return $q(function(res) {
            res();
          });
        });
      });
    };

    function remove() {
      var defer = $q.defer();

      return NstSvcPlaceFactory.remove(vm.place.id).then(function() {
        defer.resolve(true);
      }).catch(function(error) {
        $log.debug(error);
        defer.reject(false);
      });

      return defer.promise;
    }

    function removeMember(username) {
      var defer = $q.defer();

      return NstSvcPlaceFactory.removeMember(vm.place.id, username).then(function() {
        defer.resolve(true);
      }).catch(function(error) {
        $log.debug(error);
        defer.reject(false);
      });

      return defer.promise;
    }

    function updatePrivacy(name, value) {
      if (name && value){
        vm.place.privacy[name] = value;
      }
      update('privacy', vm.place.privacy).then(function (result) {
        if (result) {
          console.log('hoohoooo!');
        }
      }).catch(function (error) {

      });
    }

    function update(property, value) {
      var defer = $q.defer();

      if (property && value) {
        vm.place[property] = value;
      }

      NstSvcPlaceFactory.save(vm.place).then(function(result) {
        defer.resolve(true);
      }).catch(function(error) {
        $log.debug(error);
        defer.reject(false);
      });

      return defer.promise;
    }

    function setNotification() {
      NstSvcPlaceFactory.setNotificationOption(vm.placeId).then(function (result) {
        console.log('yeah baby!');
      }).catch(function (error) {

      });
    }
  }
})();
