(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavbarController', NavbarController);

  /** @ngInject */
  function NavbarController($scope, $rootScope, NstSvcAuth, $state, $timeout) {
    var vm = this;
    // $scope.$watch('place', function (newValue, oldValue) {
    //   // if (oldValue !== newValue) {
    //   //   vm.place = newValue;
    //   // }
    // });

    /*****************************
     *** Controller Properties ***
     *****************************/
    
    $scope.user = NstSvcAuth.getUser();
    

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
      if (vm.hasPlace()) {
        $state.go('place-messages', {
          placeId : $scope.place.id
        });
      } else {
        $state.go('messages');
      }
    };

    vm.navigateActivity = function () {
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

  }
})();
