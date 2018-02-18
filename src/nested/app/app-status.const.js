(function() {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .constant('NST_APP_STATUS', {
      HOOK_EVENT_TYPE_PLACE_NEW_POST: 0x101,
      HOOK_EVENT_TYPE_PLACE_NEW_POST_COMMENT: 0x102,
      HOOK_EVENT_TYPE_PLACE_NEW_MEMBER: 0x103,
      HOOK_EVENT_TYPE_ACCOUNT_TASK_ASSIGNED: 0x201
    });
})();
