(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nestedNavbar', nestedNavbar);

  /** @ngInject */
  function nestedNavbar() {
    return {
      restrict: 'E',
      controller: 'NavbarController',
      controllerAs: 'ctlNavbar',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {
        place : '='
      }
    };
  }

})();
