(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskProgressIcon', taskProgress);

  /** @ngInject */
  function taskProgress(NST_TASK_PROGRESS_ICON) {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/task-progress/task-progress-icon.html',
      scope: {
        status: '=status',
        progress: '=progress'
      },
      link: function ($scope, element) {
        $scope.statuses = NST_TASK_PROGRESS_ICON;
        if ($scope.status === NST_TASK_PROGRESS_ICON.ASSIGNED_PROGRESS && $scope.progress !== undefined) {
          var ratio = ($scope.progress/100)*57;
          setTimeout(function () {
            element.find('.task-progress-icon svg.progress circle').css('stroke-dasharray', ratio + ' 60');
          }, 1000);
        }
      }
    };
  }
})();
