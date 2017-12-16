(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.task')
      .directive('taskViewItem', taskViewItem);
  
    /** @ngInject */
    function taskViewItem($state, NST_TASK_STATUS, NstSvcTaskUtility) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/task/common/list/task-view-item.html',
        link: function ($scope, $el) {
            $scope.ctrl = {
                statuses: NST_TASK_STATUS,
                editTask: function (id) {
                    $state.go('app.task.edit', {
                      taskId: id
                    }, {
                      notify: false
                    });
                },
                getTaskIcon: NstSvcTaskUtility.getTaskIcon
            }
        }
      };
    }
  
  })();
  