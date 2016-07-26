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
      if (hasPlace()){
        return $scope.place.name;
      } else {
        return 'All Places';
      }
    };

    function getPlaceId() {
      if (hasPlace()){
        return $scope.place.id;
      } else {
        return '';
      }
    };

    function getPlacePicture() {
      if (hasPlace()){
        return $scope.place.picture.thumbnails.x64.url.view;
      } else {
        return '';
      }
    };


    function hasPlace() {
      return $scope.place && $scope.place.id;
    };

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
