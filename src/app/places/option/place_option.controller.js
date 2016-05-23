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
    }
  }
})();
