(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskTodo', taskTodo);

  /** @ngInject */
  function taskTodo() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/todo/todo.html',
      controller: 'TaskTodoController',
      controllerAs: 'ctlTodo',
      scope: {},
      bindToController: {
        todosData: '=',
        todoFocus: '=',
        todoPlaceholder: '@',
        removeItems: '='
      }
    };
  }

})();
