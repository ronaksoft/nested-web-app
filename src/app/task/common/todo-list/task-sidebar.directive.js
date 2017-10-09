(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('nstTaskSidebar', Sidebar);

  /** @ngInject */
  function Sidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/todo-list/todo-list.html',
      controller: 'TodoListController',
      controllerAs: 'ctrl'
    };
  }
})();
