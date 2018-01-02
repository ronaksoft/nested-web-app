(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('nstTaskSidebar', Sidebar);

  /** @ngInject */
  function Sidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/sidebar/task-sidebar.html',
      controller: 'TaskSidebarController',
      controllerAs: 'sidebarCtrl'
    };
  }
})();
