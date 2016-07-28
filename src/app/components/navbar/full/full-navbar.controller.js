(function() {
  'use strict';

  angular
    .module('nested')
    .controller('FullNavbarController', FullNavbarController);

  /** @ngInject */
  function FullNavbarController($scope, $rootScope, NstSvcAuth, $state, $timeout) {
    var vm = this;
    // $scope.$watch('place', function (newValue, oldValue) {
    //   // if (oldValue !== newValue) {
    //   //   vm.place = newValue;
    //   // }
    // });

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.user = NstSvcAuth.getUser();
    vm.urls = {
      messages : '',
      activity : '',
      settings : ''
    };
    vm.hasPlace = hasPlace;
    vm.getPlaceId = getPlaceId;
    vm.getPlaceName = getPlaceName;
    vm.getPlacePicture = getPlacePicture;

    generateUrls();

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

    function getPlaceName() {
      return hasPlace() ? vm.place.name : 'All Places';
    }

    function getPlaceId() {
      return hasPlace() ? vm.place.id : '';
    }

    function getPlacePicture() {
      return hasPlace() ? vm.place.getPicture().getThumbnail(64).getUrl().view : '';
    }


    function hasPlace() {
      return vm.place && vm.place.id;
    }

    function generateUrls() {
      if (vm.hasPlace()){
        vm.urls.messages = $state.href('place-messages', { placeId : vm.getPlaceId() });
        vm.urls.activity = $state.href('place-activity', { placeId : vm.getPlaceId() });
        vm.urls.settings = $state.href('place-settings', { placeId : vm.getPlaceId() });
      } else {
        vm.urls.messages = $state.href('messages');
        vm.urls.activity = $state.href('activity');
        vm.urls.settings = '';
      }
    }

    $scope.$watch('topNavOpen',function (newValue,oldValue) {
      $rootScope.topNavOpen = newValue;
    });
  }
})();
