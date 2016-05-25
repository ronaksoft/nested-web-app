(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PlaceOptionController', PlaceOptionController);

  /** @ngInject */
  function PlaceOptionController($location, $scope, $stateParams, AuthService, NestedPlace) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    if ($stateParams.hasOwnProperty('placeId')) {
      $scope.place = new NestedPlace($stateParams.placeId);
      $scope.place.loadAllMembers();
    } else {
      $location.path('/places').replace();
    }

    $scope.logo = null;

    vm.actions = {
      'delete': {
        name: 'Delete',
        fn: function () {}
      },
      'leave': {
        name: 'Leave',
        fn: function () {}
      },
      'rename': {
        name: 'Rename',
        fn: function () {}
      },
      'add': {
        name: 'Add a Subplace',
        url: '#/create_place/' + $scope.place.id
      }
    };

    vm.imgToUri = function (event) {
      var element = event.currentTarget;

      for (var i = 0; i < element.files.length; i++) {
        $scope.logo = element.files[i];

        var reader = new FileReader();
        reader.onload = function (event) {
          $scope.place.picture.org.url = event.target.result;
        };

        reader.readAsDataURL($scope.logo);
      }
    };

    vm.updatePrivacy = function (event) {
      var element = event.currentTarget;
      var data = {
        privacy: {}
      };
      data.privacy[element.name] = 'on' == element.value;

      return $scope.place.update(data);
    };

    vm.updatePlace = function (name, value) {
      var data = {};
      data[name] = value;

      return $scope.place.update(data);
    }
  }
})();
