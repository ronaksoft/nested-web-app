(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskTodoItem', taskTodo);

  /** @ngInject */
  function taskTodo() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/todo/todo-item.html',
      scope: {
        data: '=todoData',
        focus: '=todoFocus',
        add: '=todoAdd',
        remove: '=todoRemove',
        placeholder: '@placeholder'
      },
      link: function ($scope, _) {
        $scope.data.checked = false;

        if ($scope.focus) {
          $scope.focus = false;
        }

        $scope.inputKeyDown = function (event) {
          if (event.keyCode === 13 && !event.shiftKey) {
            $scope.add($scope.data.id);
          }
        };

        var lastValue = $scope.data.value;
        $scope.inputKeyUp = function (event) {
          if (event.keyCode === 8 && lastValue === '') {
            $scope.remove($scope.data.id);
          }
          lastValue = $scope.data.value;
        };
      }
    };
  }
})();
