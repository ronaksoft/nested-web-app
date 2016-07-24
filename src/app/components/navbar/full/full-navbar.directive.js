(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nestedNavbar', Navbar);

  /** @ngInject */
  function Navbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/full/full-navbar.html',
      controller: 'FullNavbarController',
      controllerAs: 'ctlFullNavbar',
      scope: {
        place : '='
      }
    };
  }
})();
