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
        update: '=todoUpdate',
        remove: '=todoRemove',
        editMode: '=',
        placeholder: '@placeholder',
        focusMe: '=todoFocusMe',
        check: '=todoCheck',
        enableCheck: '=enableCheck'
      },
      link: function ($scope) {

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

        var lastText = $scope.data.text;
        $scope.inputKeyUp = function (event) {
          if (event.keyCode === 8 && lastText === '') {
            if (_.isFunction($scope.remove)) {
              $scope.remove($scope.data.id);
            }
          }
          lastText = $scope.data.text;
        };

        $scope.checkChanged = function () {
          $scope.check($scope.data.id);
        };

        $scope.inputBlur = function () {
          if (_.isFunction($scope.update)) {
            $scope.update($scope.data.id);
          }
        };
      }
    };
  }
})();
