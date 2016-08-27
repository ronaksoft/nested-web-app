(function() {
  'use strict';

  angular
    .module('nested')
    .controller('FullNavbarController', FullNavbarController);

  /** @ngInject */
  function FullNavbarController($scope, $rootScope, NstSvcAuth, $state, NstSearchQuery) {
    var vm = this;
    // $scope.$watch('place', function (newValue, oldValue) {
    //   console.log('place value is : ', newValue);
    //   if (oldValue !== newValue) {
    //     vm.place = newValue;
    //     generateUrls();
    //   }
    // });

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.user = NstSvcAuth.getUser();
    vm.hasPlace = hasPlace;
    vm.getPlaceId = getPlaceId;
    vm.getPlaceName = getPlaceName;
    vm.getPlacePicture = getPlacePicture;
    vm.getMessagesUrl = getMessagesUrl;
    vm.getActivityUrl = getActivityUrl;
    vm.getSettingsUrl = getSettingsUrl;
    vm.search = search;
    // generateUrls();

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
      var avatar = '/assets/icons/absents_place.svg';
      if (hasPlace()) {
        var thumbnail = vm.place.getPicture().getThumbnail(64);
        if (thumbnail) {
          if (!thumbnail.getId()) {
            thumbnail = vm.place.getPicture().getLargestThumbnail();
          }

          if (thumbnail.getId()) {
            avatar = thumbnail.getUrl().view;
          }
        }
      }

      return avatar;
    }


    function hasPlace() {
      return vm.place && vm.place.id;
    }


    function getMessagesUrl() {
      if (hasPlace()) {
        return $state.href('place-messages', { placeId : vm.getPlaceId() });
      } else {
        return $state.href('messages');
      }
    }
    function getActivityUrl() {
      if (hasPlace()) {
        return $state.href('place-activity', { placeId : vm.getPlaceId() });
      } else {
        return $state.href('activity');
      }
    }
    function getSettingsUrl() {
      if (hasPlace()) {
        return $state.href('place-settings', { placeId : vm.getPlaceId() });
      } else {
        return '';
      }
    }

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }

    function search(query, event) {
      if (!sendKeyIsPressed(event)) {
        return;
      }

      $state.go('search', { query : NstSearchQuery.encode(query) });
    }

    $scope.$watch('topNavOpen',function (newValue,oldValue) {
      $rootScope.topNavOpen = newValue;
    });
  }
})();
