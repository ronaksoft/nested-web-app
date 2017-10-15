(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskTodoItem', taskTodo);

  /** @ngInject */
  function taskTodo(_) {
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
      link: function ($scope) {
        $scope.data.checked = false;

        if ($scope.focus) {
          $scope.focus = false;
        }

        $scope.inputKeyDown = function (event) {
          if (event.keyCode === 13 && !event.shiftKey) {
            if (_.isFunction($scope.add)) {
              $scope.add($scope.data.id);
            }
          }
        };

        var lastValue = $scope.data.value;
        $scope.inputKeyUp = function (event) {
          if (event.keyCode === 8 && lastValue === '') {
            if (_.isFunction($scope.remove)) {
              $scope.remove($scope.data.id);
            }
          }
          lastValue = $scope.data.value;
        };
      }
    };
  }
})();
