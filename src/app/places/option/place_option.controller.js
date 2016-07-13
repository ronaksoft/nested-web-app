(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceOptionController', PlaceOptionController);

  /** @ngInject */
  function PlaceOptionController($location, $rootScope, $scope, $stateParams, $q, $uibModal, NstSvcStore, UPLOAD_TYPE, NstSvcAuth, NestedPlace, PLACE_ACCESS) {
    var vm = this;

    if (!NstSvcAuth.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.logo = null;
    $scope.place = new NestedPlace();

    vm.actions = {
      'leave': {
        name: 'Leave',
        fn: function () {
          vm.leaveModal();
        }
      }
    };

    if ($stateParams.hasOwnProperty('placeId')) {
      $scope.place.load($stateParams.placeId).then(function (place) {
        if (place.haveAccess(PLACE_ACCESS.REMOVE_PLACE)) {
          $scope.place_option.actions['delete'] = {
            name: 'Delete',
            fn: function () {
              vm.showDeleteModal()
            }
          };
        }

        if (place.haveAccess(PLACE_ACCESS.ADD_PLACE)) {
          $scope.place_option.actions['add'] = {
            name: 'Add a Subplace',
            url: '#/create_place/' + place.id
          };
        }
      });
      $scope.place.loadAllMembers();
    } else {
      $location.path('/places').replace();
    }

    vm.imgToUri = function (event) {
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.place.picture.org.url = event.target.result;
          $scope.place.picture.x32.url = $scope.place.picture.org.url;
          $scope.place.picture.x64.url = $scope.place.picture.org.url;
          $scope.place.picture.x128.url = $scope.place.picture.org.url;

          return NstSvcStore.upload($scope.logo, UPLOAD_TYPE.PLACE_PICTURE).then(function (response) {
            $scope.place.picture.org.uid = response.universal_id;
            $scope.logo = null;

            return $scope.place.setPicture(response.universal_id);
          });
        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.updatePrivacy = function (event) {
      var element = event.currentTarget;
      var data = {};
      data['privacy.' + element.name] = element.checked;

      return $scope.place.update(data);
    };

    vm.updatePlace = function (name, value) {
      var data = {};
      data[name] = value;

      return $scope.place.update(data);
    };


    $scope.checkplace = function (PlaceId) {
      if (PlaceId == $scope.place.id){
        $scope.deleteValidated = true;
      }else {
        $scope.deleteValidated = false;
      }
    };

    vm.showAddModal = function (role) {
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

      modal.closed.then(function () {
        delete $scope['add_' + role];
        delete $scope.role;
        delete $scope.closeModal;
      });
    };
    vm.showLockModal = function (event) {
      event.preventDefault();
      event.stopPropagation();

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/warning.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function () {
        var data = {};
        data['privacy.locked'] = $scope.place.privacy.locked;

        return $scope.place.update(data);
      }).catch(function () {
        $scope.place.privacy.locked = !$scope.place.privacy.locked;
      });

      return false;
    };
    vm.showDeleteModal = function () {

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
          function () {
            if($scope.deleteValidated == true){
              $scope.place.delete();
              return $q(function (res) {res($scope.place.id);$location.path('/places').replace();})
            }
          },
          function () {
            console.log("canceled")
          }
        );

    };

    vm.removeMember = function (user) {
      $scope.member = user;

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/places/context_menu/remove.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function () {
        return $scope.place.removeMember($scope.member.username);
      });
    };

    vm.leaveModal = function () {

      $uibModal.open({
        animation: false,
        templateUrl: 'app/places/option/leave.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function () {
        return $scope.place.removeMember(NstSvcAuth.user.username).then(function () {
          $location.path('/places').replace();

          return $q(function (res) {
            res();
          });
        });
      });
    };

  }
})();
