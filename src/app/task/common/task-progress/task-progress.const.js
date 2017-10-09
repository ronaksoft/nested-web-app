(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .constant('NST_TASK_PROGRESS_ICON', {
      NOT_ASSIGNED: 'not-assigned',
      ASSIGNED_NO_CHECKLIST: 'assigned-no-checklist',
      ASSIGNED_CHECKLIST: 'assigned-checklist',
      ASSIGNED_PROGRESS: 'assigned-progress',
      COMPLETED: 'completed',
      HOLD: 'hold',
      REJECTED: 'rejected',
      OVERDUE: 'overdue'
    });
})();

