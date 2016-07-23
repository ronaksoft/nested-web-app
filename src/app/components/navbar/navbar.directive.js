(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nestedNavbar', nestedNavbar);

  /** @ngInject */
  function nestedNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      controller: 'NavbarController',
      controllerAs: 'navbarCtrl',
      scope: {
        place : '='
      }
    };
  }

})();
