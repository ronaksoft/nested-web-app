(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nestedMiniNavbar', MiniNavbar);

  /** @ngInject */
  function MiniNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/mini/mini-navbar.html',
      controller: 'MiniNavbarController',
      controllerAs: 'ctlMiniNavbar',
      bindToController: true
    };
  }
})();
