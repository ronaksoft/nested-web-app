(function () {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('taskActivityItem', taskActivityItem);

  /** @ngInject */
  function taskActivityItem(NST_TASK_EVENT_ACTION, NstUtility, $) {
    return {
      restrict: 'E',
      transclude : true,
      scope: {
        activity: '=',
        taskId: '='
      },
      link: function (scope) {
        scope.commentCnst = NST_TASK_EVENT_ACTION.COMMENT;
        scope.baseTplUrl = 'app/task/common/activity/partials/base.html';
        switch (scope.activity.type) {
          case NST_TASK_EVENT_ACTION.WATCHER_ADDED:
            scope.tplUrl = 'app/task/common/activity/partials/watcher-added.html';
            break;
          case NST_TASK_EVENT_ACTION.WATCHER_REMOVED:
            scope.tplUrl = 'app/task/common/activity/partials/watcher-remove.html';
            break;
          case NST_TASK_EVENT_ACTION.ATTACHMENT_ADDED:
            scope.tplUrl = 'app/task/common/activity/partials/attachment-added.html';
            break;
          case NST_TASK_EVENT_ACTION.ATTACHMENT_REMOVED:
            scope.tplUrl = 'app/task/common/activity/partials/attachment-removed.html';
            break;
          case NST_TASK_EVENT_ACTION.COMMENT:
            scope.tplUrl = 'app/task/common/activity/partials/comment.html';
            break;
          case NST_TASK_EVENT_ACTION.TITLE_CHANGED:
            scope.tplUrl = 'app/task/common/activity/partials/title-changed.html';
            break;
          case NST_TASK_EVENT_ACTION.DESC_CHANGED:
            scope.tplUrl = 'app/task/common/activity/partials/desc-changed.html';
            break;
          case NST_TASK_EVENT_ACTION.CANDIDATE_ADDED:
            scope.tplUrl = 'app/task/common/activity/partials/candidate-added.html';
            break;
          case NST_TASK_EVENT_ACTION.CANDIDATE_REMOVED:
            scope.tplUrl = 'app/task/common/activity/partials/candidate-removed.html';
            break;
          case NST_TASK_EVENT_ACTION.TODO_ADDED:
            scope.tplUrl = 'app/task/common/activity/partials/todo-added.html';
            break;
          case NST_TASK_EVENT_ACTION.TODO_REMOVED:
            scope.tplUrl = 'app/task/common/activity/partials/todo-removed.html';
            break;
          case NST_TASK_EVENT_ACTION.TODO_CHANGED:
            scope.tplUrl = 'app/task/common/activity/partials/todo-changed.html';
            break;
          case NST_TASK_EVENT_ACTION.TODO_DONE:
            scope.tplUrl = 'app/task/common/activity/partials/todo-done.html';
            break;
          case NST_TASK_EVENT_ACTION.TODO_UNDONE:
            scope.tplUrl = 'app/task/common/activity/partials/todo-undone.html';
            break;
          case NST_TASK_EVENT_ACTION.LABEL_ADDED:
            scope.tplUrl = 'app/task/common/activity/partials/label-added.html';
            break;
          case NST_TASK_EVENT_ACTION.LABEL_REMOVED:
            scope.tplUrl = 'app/task/common/activity/partials/label-removed.html';
            break;
          case NST_TASK_EVENT_ACTION.DUE_DATE_UPDATED:
            scope.tplUrl = 'app/task/common/activity/partials/due-date-updated.html';
            break;
          case NST_TASK_EVENT_ACTION.DUE_DATE_REMOVED:
            scope.tplUrl = 'app/task/common/activity/partials/due-date-removed.html';
            break;
        }
      },
      template: function () {
        return '<div data-ng-include="baseTplUrl" data-ng-init="commentConst = commentCnst" class="task-activity"></div>';
      }
    };
  }

})();
