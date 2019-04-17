(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .constant('NST_TASK_ACCESS', {
      PICK_TASK: 0x0001,
      ADD_CANDIDATE: 0x0002,
      READ_TASK: 0x0003,
      CHANGE_ASSIGNEE: 0x0008,
      CHANGE_PRIORITY: 0x0020,
      LABEL: 0x0040,
      COMMENT: 0x0080,
      ADD_ATTACHMENT: 0x00F0,
      REMOVE_ATTACHMENT: 0x0100,
      ADD_WATCHER: 0x0200,
      REMOVE_WATCHER: 0x0400,
      DELETE_TASK: 0x0800,
      ADD_LABEL: 0x0101,
      REMOVE_LABEL: 0x0102,
      UPDATE_TASK: 0x0103,
      ADD_EDITOR: 0x0108,
      REMOVE_EDITOR: 0x0109
    });
})();
