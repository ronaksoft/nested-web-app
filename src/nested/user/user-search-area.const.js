(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .constant('NST_USER_SEARCH_AREA', {
      ACCOUNTS: '_for_member',
      ADD : '_for_add',
      INVITE : '_for_invite',
      MENTION : '_for_mention'
    })
})();
