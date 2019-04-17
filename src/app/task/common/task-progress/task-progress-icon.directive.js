(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskProgressIcon', taskProgress);

  /** @ngInject */
  function taskProgress(NST_TASK_PROGRESS_ICON, $timeout, _) {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/task-progress/task-progress-icon.html',
      scope: {
        status: '=status',
        progress: '=progress'
      },
      link: function ($scope, element) {
        var eventReferences = [];
        var drawDebounce = _.debounce(drawPie, 100);
        $scope.statuses = NST_TASK_PROGRESS_ICON;

        function drawPie() {
          if ($scope.status === NST_TASK_PROGRESS_ICON.ASSIGNED_PROGRESS && $scope.progress !== undefined) {
            var ratio = ($scope.progress/100)*56.4;
            $timeout(function () {
              element.find('.task-progress-icon svg.progress circle').css('stroke-dasharray', ratio + ' 60');
            }, 300);
          }
        }

        drawDebounce();
        eventReferences.push($scope.$watch('progress', function () {
          drawDebounce();
        }));

        $scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }
    };
  }
})();
