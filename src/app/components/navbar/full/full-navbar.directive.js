(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .directive('nstNavbar', Navbar);

  /** @ngInject */
  function Navbar($rootScope,$window) {
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
        query: '='
      },
      link: function ($scope, $element, $attrs) {
      }
    };
  }
})();
