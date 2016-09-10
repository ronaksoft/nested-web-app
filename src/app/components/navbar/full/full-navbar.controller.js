(function() {
  'use strict';

  angular
    .module('nested')
    .controller('FullNavbarController', FullNavbarController);

  /** @ngInject */
  function FullNavbarController($scope, $rootScope, NstSvcAuth, $state, NstSearchQuery) {
    var vm = this;
    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.people = [
      { label: 'ehsan'},
      { label: 'sorousht'},
      { label: 'naamesteh'},
      { label: 'pouya'},
      { label: 'asal'},
      { label: 'moosamir'},
      { label: 'kayvan'}
    ];

    isBookMark();
    vm.user = NstSvcAuth.getUser();
    vm.hasPlace = hasPlace;
    vm.getPlaceId = getPlaceId;
    vm.getMessagesUrl = getMessagesUrl;
    vm.getActivityUrl = getActivityUrl;
    vm.getSettingsUrl = getSettingsUrl;
    vm.search = search;


    vm.srch = function srch(el) {
      var ele = $('#' + el);
      var eleInp = ele.find('input');
      var elePrv = ele.next();
      var openStat = function () {
        return ele[0].clientWidth > 0
      };
      function open() {
        ele.stop().animate({
          maxWidth : 1000
        },300);
        eleInp.focus();
      }
      function close() {
        ele.stop().animate({
          maxWidth : 0
        },100);
        eleInp.val("");
      }
      elePrv.stop().fadeToggle('slow','swing');
      if (openStat()) {
        close()
      } else {
        open()
      }
    };

    function getPlaceId() {
      return vm.placeId;
    }

    function hasPlace() {
      return !!vm.placeId;
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

    function isBookMark() {
      if ($state.current.name == 'messages-bookmarks' ||
        $state.current.name == 'messages-bookmarks-sorted'){
        vm.isBookmarkMode = true;
        return true;
      }
      return false;
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
      if (!sendKeyIsPressed(event) || !query) {
        return;
      }
      var searchQury = new NstSearchQuery(query);

      if (hasPlace()){
        searchQury.addPlace(getPlaceId());
      }

      $state.go('search', { query : NstSearchQuery.encode(searchQury.toString()) });
    }

    $scope.$watch('topNavOpen',function (newValue,oldValue) {
      $rootScope.topNavOpen = newValue;
    });
  }
})();
