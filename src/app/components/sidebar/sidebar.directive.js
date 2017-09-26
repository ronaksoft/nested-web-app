(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstSidebar', Sidebar);

  /** @ngInject */
  function Sidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      controller: 'SidebarController',
      controllerAs: 'ctlSidebar',
      bindToController: {
        collapsed: '='
      }
    };
  }
})();
