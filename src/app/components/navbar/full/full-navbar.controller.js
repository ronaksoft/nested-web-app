(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .controller('FullNavbarController', FullNavbarController);

  /** @ngInject */
  function FullNavbarController($scope, $rootScope, NstSvcAuth, $state, NstSearchQuery, NST_DEFAULT) {
    var vm = this;
    /*****************************
     *** Controller Properties ***
     *****************************/

    isBookMark();
    vm.user = NstSvcAuth.getUser();
    vm.hasPlace = hasPlace;
    vm.getPlaceId = getPlaceId;
    vm.getMessagesUrl = getMessagesUrl;
    vm.getActivityUrl = getActivityUrl;
    // vm.getFilesUrl = getFilesUrl;
    vm.getSettingsUrl = getSettingsUrl;
    vm.search = search;
    vm.rollUpward = rollUpward;
    vm.rollToTop = false;


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
        return $state.href('app.place-messages', { placeId : vm.getPlaceId() });
      } else {
        return $state.href('app.messages');
      }
    }
    // function getFilesUrl() {
    //   if (hasPlace()) {
    //     return $state.href('place-Files', { placeId : vm.getPlaceId() });
    //   } else {
    //     return '';
    //   }
    // }
    function getActivityUrl() {
      if (hasPlace()) {
        return $state.href('app.place-activity', { placeId : vm.getPlaceId() });
      } else {
        return $state.href('app.activity');
      }
    }
    function getSettingsUrl() {
      if (hasPlace()) {
        return $state.href('app.place-settings', { placeId : vm.getPlaceId() });
      } else {
        return '';
      }
    }

    function isBookMark() {
      if ($state.current.name == 'app.messages-bookmarks' ||
        $state.current.name == 'app.messages-bookmarks-sorted'){
        vm.isBookmarkMode = true;
        return true;
      }
      return false;
    }

    function rollUpward(group) {
      if (group === $state.current.options.group) {
        vm.rollToTop = true;
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

      var element = angular.element(event.target);
      if (!sendKeyIsPressed(event) || !query || element.attr("mention") === "true") {
        return;
      }
      var searchQury = new NstSearchQuery(query);

      if (hasPlace()){
        searchQury.addPlace(getPlaceId());
      }

      $state.go('app.search', { query : NstSearchQuery.encode(searchQury.toString()) });
    }

    $scope.$watch('topNavOpen',function (newValue,oldValue) {
      $rootScope.topNavOpen = newValue;
    });
  }
})();
