(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_USER_SEARCH_AREA', {
      ACCOUNTS: '_for_search',
      ADD: '_for_add',
      INVITE: '_for_invite',
      MENTION: '_for_mention',
      TASK_MENTION: '_for_task_mention'
    })
})();
