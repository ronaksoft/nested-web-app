(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstTaskSidebar', Sidebar);

  /** @ngInject */
  function Sidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/sidebar/task-sidebar.html',
      controller: 'TaskSidebarController',
      controllerAs: 'ctlSidebar'
    };
  }
})();
