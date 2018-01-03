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
          function setLocationFlag() {
            switch ($state.current.name) {
              default:
              case 'app.task.glance':
                $scope.ctrl.isGlancePage = true;
                break;
              case 'app.task.assigned_to_me':
                $scope.ctrl.isAssignedToMePage = true;
                break;
              case 'app.task.created_by_me':
                $scope.ctrl.isCreatedByMePage = true;
                break;
              case 'app.task.watchlist':
                $scope.ctrl.isWatchlistPage = true;
                break;
              case 'app.task.custom_filter':
                $scope.ctrl.isCustomFilterPage = true;
                break;
            }
          }
          $scope.ctrl = {
            statuses: NST_TASK_STATUS,
            isGlancePage: false,
            isAssignedToMePage: false,
            isCreatedByMePage: false,
            isWatchlistPage: false,
            isCustomFilterPage: false,
            editTask: function (id) {
                $state.go('app.task.edit', {
                  taskId: id
                }, {
                  notify: false
                });
            },
            getTaskIcon: NstSvcTaskUtility.getTaskIcon
          };
          setLocationFlag();
        }
      };
    }

  })();
