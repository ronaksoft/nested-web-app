(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskTodoItem', taskTodo);

  /** @ngInject */
  function taskTodo() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/todo-item/todo-item.html',
      scope: {
        focus: '=todoFocus'
      },
      link: function ($scope) {
        $scope.isChecked = false;
      }
    };
  }
})();
