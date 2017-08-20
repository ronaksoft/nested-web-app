(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .directive('nstNavbar', Navbar);

  /** @ngInject */
  function Navbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/full/full-navbar.html',
      controller: 'FullNavbarController',
      controllerAs: 'ctlFullNavbar',
      bindToController: true,
      scope: {
        page: '=',
        showPlaceId : '=',
        pictureUrl : '@navPictureUrl',
        pictureClass : '@navPictureClass',
        title : '@navTitle',
        placeId : '@',
        readyToShow : '=',
        placeDescription: '@',
        account: '=',
        query: '=',
        searchOnKeypress : '=',
        forceSearch : '=',
        removeLastChip : '='
      },
      link: function () {
      }
    };
  }
})();
