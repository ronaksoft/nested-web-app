(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstSidebar', Sidebar);

  /** @ngInject */
  function Sidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      controller: 'SidebarController',
      controllerAs: 'ctlSidebar',
      bindToController: true
    };
  }
})();
