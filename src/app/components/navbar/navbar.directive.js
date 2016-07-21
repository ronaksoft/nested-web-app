(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, $rootScope, NstSvcAuth, $state, $timeout) {
      var vm = this;
      // $scope.$watch('place', function (newValue, oldValue) {
      //   // if (oldValue !== newValue) {
      //   //   vm.place = newValue;
      //   // }
      // });

      $scope.user = NstSvcAuth.user;
      $scope.topNavOpen = false;

      $scope.srch = function srch() {
        for (var i = 0; i < arguments.length; i++) {
          var id = arguments[i];
          var e = document.getElementById(id);
          if (e.style.display == 'block')
            e.style.display = 'none';
          else {
            e.style.display = 'block';
          }
        }
      };

      vm.getPlaceName = function () {
        if (vm.hasPlace()){
          return $scope.place.name;
        } else {
          return 'All Places';
        }
      };

      vm.getPlaceId = function () {
        if (vm.hasPlace()){
          return $scope.place.id;
        } else {
          return '';
        }
      };

      vm.getPlacePicture = function () {
        if (vm.hasPlace()){
          return $scope.place.picture.thumbnails.x64.url.view;
        } else {
          return '';
        }
      };


      vm.hasPlace = function () {
        return $scope.place && $scope.place.id;
      };

      vm.navigateMessages = function () {
        console.log($scope);
        if (vm.hasPlace()) {
          $state.go('place-messages', {
            placeId : $scope.place.id
          });
        } else {
          $state.go('messages');
        }
      };

      vm.navigateActivity = function () {
        console.log($scope);
        if (vm.hasPlace()) {
          $state.go('place-activity', {
            placeId : $scope.place.id
          });
        } else {
          $state.go('activity');
        }
      };

      vm.navigateSetting = function () {
        if (vm.hasPlace()) {
          $state.go('place-settings', {
            placeId : $scope.place.id
          });
        }
      };
    })
    .directive('nestedNavbar', nestedNavbar);

  /** @ngInject */
  function nestedNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      controller: 'NavBarController',
      controllerAs: 'navbarCtrl',
      scope: {
        place : '='
      }
    };
  }

})();
