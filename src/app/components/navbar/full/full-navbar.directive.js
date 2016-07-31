(function() {
  'use strict';

  angular
    .module('nested')
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
        controls: '=',
        place: '='
      }
    };
  }
})();
