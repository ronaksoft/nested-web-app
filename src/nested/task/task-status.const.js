(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .constant('NST_TASK_STATUS', {
      ASSIGNED_TO_ME: 'assigned_to_me',
      CREATED_BY_ME: 'created_by_me',
      WATCHED: 'watched',
      CANDIDATE: 'candidate',

      NO_ASSIGNED: 0x01,
      ASSIGNED: 0x02,
      CANCELED: 0x03,
      REJECTED: 0x04,
      COMPLETED: 0x05,
      HOLD: 0x06,
      OVERDUE: 0x07
    });
})();
