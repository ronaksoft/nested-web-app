(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceOptionController', PlaceOptionController);

  /** @ngInject */
  function PlaceOptionController($location, $scope, $stateParams, $q, $uibModal, StoreService, UPLOAD_TYPE, AuthService, NestedPlace, PLACE_ACCESS) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.logo = null;
    $scope.place = new NestedPlace();

    vm.actions = {
      'leave': {
        name: 'Leave',
        fn: function () {}
      }
    };

    if ($stateParams.hasOwnProperty('placeId')) {
      $scope.place.load($stateParams.placeId).then(function (place) {
        if (place.haveAccess(PLACE_ACCESS.REMOVE_PLACE)) {
          $scope.place_option.actions['delete'] = {
            name: 'Delete',
            fn: function () {
              return $scope.place.delete().then(function () {
                return $q(function (res) {
                  res($scope.place.id);

                  $location.path('/places').replace();
                });
              });
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

          return StoreService.upload($scope.logo, UPLOAD_TYPE.PLACE_PICTURE).then(function (response) {
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
  }
})();
