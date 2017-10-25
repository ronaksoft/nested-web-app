(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('nstTaskActivity', TaskActivity);

  /**
   * array of comments that comments-board.controller.js controls the them all
   */
  function TaskActivity() {
    return {
      restrict: 'E',
      scope:{},
      templateUrl: 'app/task/common/activity/task-activity.html',
      controller: 'TaskActivityController',
      controllerAs: 'ctrl',
      bindToController: {
        taskId: '=',
        onlyComment: '=',
        totalCommentsCount : '=',
        onCommentSent : '=',
        hasCommentRemoveAccess : '=',
        activityCount: '='
      }
    };
  }

})();
