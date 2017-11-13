(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .constant('NST_TASK_EVENT_ACTION', {
      TASK_ACTIVITY: 'task-activity',

      WATCHER_ADDED: 0x0001,
      WATCHER_REMOVED: 0x0002,
      ATTACHMENT_ADDED: 0x0003,
      ATTACHMENT_REMOVED: 0x0004,
      COMMENT: 0x0006,
      TITLE_CHANGED: 0x0007,
      DESC_CHANGED: 0x0008,
      CANDIDATE_ADDED: 0x0011,
      CANDIDATE_REMOVED: 0x0012,
      TODO_ADDED: 0x0013,
      TODO_REMOVED: 0x0014,
      TODO_CHANGED: 0x0015,
      TODO_DONE: 0x0016,
      TODO_UNDONE: 0x0017,
      STATUS_CHANGED: 0x0018,
      LABEL_ADDED: 0x0019,
      LABEL_REMOVED: 0x0020,
      DUE_DATE_UPDATED: 0x0021,
      DUE_DATE_REMOVED: 0x0022,
      CREATED: 0x0023,
      ASSIGNEE_CHANGED: 0x0024
    });
})();
