(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .directive('nstMiniNavbar', MiniNavbar);

  /** @ngInject */
  function MiniNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/mini/mini-navbar.html',
      controller: 'SidebarController',
      controllerAs: 'ctlMiniNavbar',
      bindToController: true
    };
  }
})();
